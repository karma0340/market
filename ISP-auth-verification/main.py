from contextlib import asynccontextmanager
import logging
import asyncio
import sys

# Windows-specific fix for Playwright/Subprocess support in asyncio
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import csv
import json
from datetime import datetime
import os
from services import jio_client, number_validator_client, vi_client

# ── CSV Logging Helper ──────────────────────────────────────────────────
CSV_FILE = "verified_profiles.csv"

def log_profile_to_csv(mobile_number, operator, profile_data, auth_data=None):
    file_exists = os.path.isfile(CSV_FILE)
    
    with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['Timestamp', 'Operator', 'Mobile Number', 'Profile Data', 'Auth Data'])
        
        prof_str = json.dumps(profile_data, ensure_ascii=False) if profile_data else "{}"
        auth_str = json.dumps(auth_data, ensure_ascii=False) if auth_data else "{}"
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        writer.writerow([timestamp, operator, mobile_number, prof_str, auth_str])

# ── Airtel import (optional — runs via Selenium headless Chrome) ───────
try:
    from services import airtel_client
    from services.airtel_api import AirtelAPIError

    AIRTEL_AVAILABLE = True
except ImportError:
    AIRTEL_AVAILABLE = False
    airtel_client = None  # type: ignore

# ── Lifespan ───────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm the Bajaj number validator to save start-up time on first request
    await number_validator_client.warm_up()
    yield
    # Shut down Playwright browser used by Bajaj number validator
    await number_validator_client.close()
    if AIRTEL_AVAILABLE and airtel_client is not None:
        await airtel_client.close()


# ── App ────────────────────────────────────────────────────────────────
app = FastAPI(title="ISP Auth Verification API", lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "ISP Auth Verification API is running successfully on port 8000", "status": "active"}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    from fastapi.responses import Response
    return Response(status_code=204)


# ── Request schemas ────────────────────────────────────────────────────
class SendOtpRequest(BaseModel):
    mobile_number: str


class ValidateOtpRequest(BaseModel):
    mobile_number: str
    otp: str


class NumberLookupRequest(BaseModel):
    mobile_number: str
    requester_mobile_number: str = "9999999999"


class VIEncryptedRequest(BaseModel):
    mobile_number: str
    otp: str | None = None
    encrypted_user_details: str | None = None


# ── Auto-Routing Endpoints (The Magic Router!) ──────────────────────────
@app.post("/api/auth/send-otp")
async def auto_send_otp(req: SendOtpRequest):
    try:
        # 1. Fast look-up using Nitro Validator
        lookup_res = await number_validator_client.lookup_operator_circle(req.mobile_number)
        logging.info(f"Lookup result for {req.mobile_number}: {lookup_res}")
        
        if not isinstance(lookup_res, dict):
            raise HTTPException(status_code=500, detail=f"Unexpected response type from validator: {type(lookup_res).__name__}")

        if "error" in lookup_res:
            raise HTTPException(status_code=400, detail=f"Operator lookup failed: {lookup_res['error']}")
            
        data_node = lookup_res.get("data")
        if not isinstance(data_node, dict):
            raise HTTPException(status_code=400, detail=f"Invalid 'data' node in validator response: {data_node}")
            
        payload_node = data_node.get("payload")
        if not isinstance(payload_node, dict):
             raise HTTPException(status_code=400, detail=f"Invalid 'payload' node in validator response: {payload_node}")

        operator_name = payload_node.get("operatorName", "").upper()
        
        if not operator_name:
            raise HTTPException(status_code=400, detail=f"Could not determine operator. Response was: {lookup_res}")
            
        response_data = {
            "operator": operator_name,
            "mobile_number": req.mobile_number,
            "status": "success"
        }
            
        # 2. Route to the correct service
        if operator_name == "JIO":
            otp_res = await jio_client.send_otp(req.mobile_number)
            response_data["service_response"] = otp_res
            return response_data
            
        elif operator_name == "AIRTEL":
            if not AIRTEL_AVAILABLE:
                raise HTTPException(status_code=501, detail="Airtel service is not configured/available.")
            otp_res = await airtel_client.send_otp(req.mobile_number)
            response_data["session_trace"] = otp_res
            return response_data
            
        elif operator_name in ["VODAFONE IDEA", "VI", "IDEA", "VODAFONE"]:
            otp_res = await vi_client.send_otp(req.mobile_number)
            response_data["service_response"] = otp_res
            return response_data
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported operator: {operator_name}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/verify-otp")
async def auto_verify_otp(req: ValidateOtpRequest):
    try:
        # 1. Fast look-up using Nitro Validator
        lookup_res = await number_validator_client.lookup_operator_circle(req.mobile_number)
        logging.info(f"Verify result for {req.mobile_number}: {lookup_res}")

        if not isinstance(lookup_res, dict):
            raise HTTPException(status_code=500, detail=f"Unexpected response from validator: {lookup_res}")
            
        if "error" in lookup_res:
            raise HTTPException(status_code=400, detail=f"Operator lookup failed: {lookup_res['error']}")
            
        data_node = lookup_res.get("data")
        if not isinstance(data_node, dict):
            raise HTTPException(status_code=400, detail=f"Invalid 'data' node in validator response: {data_node}")
            
        payload_node = data_node.get("payload")
        if not isinstance(payload_node, dict):
             raise HTTPException(status_code=400, detail=f"Invalid 'payload' node in validator response: {payload_node}")

        operator_name = payload_node.get("operatorName", "").upper()
        
        if not operator_name:
            raise HTTPException(status_code=400, detail=f"Could not determine operator. Data: {lookup_res}")
            
        response_data = {
            "operator": operator_name,
            "mobile_number": req.mobile_number,
            "status": "success"
        }
            
        # 2. Route to the correct service and fetch complete profile
        if operator_name == "JIO":
            otp_res = await jio_client.validate_otp(req.mobile_number, req.otp)
            if isinstance(otp_res, dict) and "error" in otp_res:
                raise HTTPException(status_code=400, detail=otp_res["error"])
            response_data["service_response"] = otp_res
            
            # Fetch all available Jio profiles
            try:
                response_data["profile_data"] = await jio_client.get_profile(req.mobile_number)
            except Exception as e:
                response_data["profile_data"] = {"error": str(e)}
            try:
                response_data["auth_data"] = await jio_client.get_auth_json(req.mobile_number)
            except Exception as e:
                response_data["auth_data"] = {"error": str(e)}
                
            # Log to CSV
            log_profile_to_csv(req.mobile_number, operator_name, response_data.get("profile_data"), response_data.get("auth_data"))
            return response_data
            
        elif operator_name == "AIRTEL":
            if not AIRTEL_AVAILABLE:
                raise HTTPException(status_code=501, detail="Airtel service is not configured/available.")
            otp_res = await airtel_client.verify_otp(req.mobile_number, req.otp)
            response_data["service_response"] = otp_res
            
            # Fetch Airtel profile
            try:
                response_data["profile_data"] = await airtel_client.get_profile(req.mobile_number)
            except Exception as e:
                response_data["profile_data"] = {"error": str(e)}
                
            # Log to CSV
            log_profile_to_csv(req.mobile_number, operator_name, response_data.get("profile_data"))
            return response_data
            
        elif operator_name in ["VODAFONE IDEA", "VI", "IDEA", "VODAFONE"]:
            otp_res = await vi_client.verify_otp(req.mobile_number, req.otp)
            response_data["service_response"] = otp_res
            
            # Fetch Vi profile
            try:
                response_data["profile_data"] = await vi_client.get_profile(req.mobile_number)
            except Exception as e:
                response_data["profile_data"] = {"error": str(e)}
                
            # Log to CSV
            log_profile_to_csv(req.mobile_number, operator_name, response_data.get("profile_data"))
            return response_data
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported operator: {operator_name}")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/auth/profile/{mobile_number}")
async def auto_get_profile(mobile_number: str):
    try:
        # 1. Fast look-up using Nitro Validator
        lookup_res = await number_validator_client.lookup_operator_circle(mobile_number)
        logging.info(f"Profile lookup result for {mobile_number}: {lookup_res}")

        if not isinstance(lookup_res, dict):
            raise HTTPException(status_code=500, detail=f"Unexpected response from validator: {lookup_res}")
            
        if "error" in lookup_res:
            raise HTTPException(status_code=400, detail=f"Operator lookup failed: {lookup_res['error']}")
            
        data_node = lookup_res.get("data")
        if not isinstance(data_node, dict):
            raise HTTPException(status_code=400, detail=f"Invalid 'data' node in validator response: {data_node}")
            
        payload_node = data_node.get("payload")
        if not isinstance(payload_node, dict):
             raise HTTPException(status_code=400, detail=f"Invalid 'payload' node in validator response: {payload_node}")

        operator_name = payload_node.get("operatorName", "").upper()
        
        if not operator_name:
            raise HTTPException(status_code=400, detail=f"Could not determine operator. Data: {lookup_res}")
            
        response_data = {
            "operator": operator_name,
            "mobile_number": mobile_number,
            "status": "success"
        }
            
        # 2. Route to the correct service
        if operator_name == "JIO":
            profile_res = await jio_client.get_profile(mobile_number)
            if isinstance(profile_res, dict) and "error" in profile_res:
                raise HTTPException(status_code=400, detail=profile_res["error"])
            response_data["service_response"] = profile_res
            
            # log to csv
            log_profile_to_csv(mobile_number, operator_name, profile_res)
            return response_data
            
        elif operator_name == "AIRTEL":
            if not AIRTEL_AVAILABLE:
                raise HTTPException(status_code=501, detail="Airtel service is not configured/available.")
            profile_res = await airtel_client.get_profile(mobile_number)
            response_data["service_response"] = profile_res
            
            # log to csv
            log_profile_to_csv(mobile_number, operator_name, profile_res)
            return response_data
            
        elif operator_name in ["VODAFONE IDEA", "VI", "IDEA", "VODAFONE"]:
            profile_res = await vi_client.get_profile(mobile_number)
            response_data["service_response"] = profile_res
            
            # log to csv
            log_profile_to_csv(mobile_number, operator_name, profile_res)
            return response_data
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported operator: {operator_name}")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Jio endpoints ─────────────────────────────────────────────────────
@app.post("/api/jio/send-otp")
async def send_otp(req: SendOtpRequest):
    try:
        return await jio_client.send_otp(req.mobile_number)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/jio/validate-otp")
async def validate_otp(req: ValidateOtpRequest):
    try:
        res = await jio_client.validate_otp(req.mobile_number, req.otp)
        if "error" in res:
            raise HTTPException(status_code=400, detail=res["error"])
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jio/auth-data/{mobile_number}")
async def get_auth_data(mobile_number: str):
    try:
        res = await jio_client.get_auth_json(mobile_number)
        if "error" in res:
            raise HTTPException(status_code=400, detail=res["error"])
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/jio/profile/{mobile_number}")
async def get_profile(mobile_number: str):
    try:
        res = await jio_client.get_profile(mobile_number)
        if "error" in res:
            raise HTTPException(status_code=400, detail=res["error"])
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/number-validator/lookup")
async def lookup_operator_circle(req: NumberLookupRequest):
    try:
        return await number_validator_client.lookup_operator_circle(
            req.mobile_number, req.requester_mobile_number
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── VI endpoints ──────────────────────────────────────────────────────
@app.post("/api/vi/send-otp")
async def vi_send_otp(req: SendOtpRequest):
    try:
        return await vi_client.send_otp(req.mobile_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi/verify-otp")
async def vi_verify_otp(req: ValidateOtpRequest):
    try:
        return await vi_client.verify_otp(req.mobile_number, req.otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/vi/profile/{mobile_number}")
async def vi_get_profile(mobile_number: str):
    try:
        return await vi_client.get_profile(mobile_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi/email-alt-details")
async def vi_email_alt_details(req: VIEncryptedRequest):
    try:
        return await vi_client.get_email_alt_number_details(
            req.mobile_number, req.encrypted_user_details
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi2/send-otp")
async def vi2_send_otp(req: SendOtpRequest):
    try:
        return await vi_client.alt_send_otp(req.mobile_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi2/verify-otp")
async def vi2_verify_otp(req: ValidateOtpRequest):
    try:
        return await vi_client.alt_verify_otp(req.mobile_number, req.otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi2/session-check")
async def vi2_session_check(req: SendOtpRequest):
    try:
        return await vi_client.alt_session_check(req.mobile_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi2/email-alt-details")
async def vi2_email_alt_details(req: VIEncryptedRequest):
    try:
        return await vi_client.alt_get_email_alt_number_details(
            req.mobile_number,
            otp=req.otp,
            encrypted_user_details=req.encrypted_user_details,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi-popup/send-otp")
async def vi_popup_send_otp(req: SendOtpRequest):
    try:
        return await vi_client.popup_send_otp(req.mobile_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi-popup/verify-otp")
async def vi_popup_verify_otp(req: ValidateOtpRequest):
    try:
        return await vi_client.popup_verify_otp(req.mobile_number, req.otp)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vi-popup/session-check")
async def vi_popup_session_check(req: SendOtpRequest):
    try:
        return await vi_client.popup_session_check(req.mobile_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Airtel endpoints (only registered when airtel_api is present) ─────
if AIRTEL_AVAILABLE:

    @app.post("/api/airtel/send-otp")
    async def airtel_send_otp(req: SendOtpRequest):
        try:
            res = await airtel_client.send_otp(req.mobile_number)
            return {"session_trace": res}
        except AirtelAPIError as e:
            raise HTTPException(status_code=e.status_code, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/airtel/verify-otp")
    async def airtel_verify_otp(req: ValidateOtpRequest):
        try:
            res = await airtel_client.verify_otp(req.mobile_number, req.otp)
            return res
        except AirtelAPIError as e:
            raise HTTPException(status_code=e.status_code, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/api/airtel/profile/{mobile_number}")
    async def airtel_get_profile(mobile_number: str):
        try:
            res = await airtel_client.get_profile(mobile_number)
            return res
        except AirtelAPIError as e:
            raise HTTPException(status_code=e.status_code, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ── Entrypoint ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

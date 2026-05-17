"""
Airtel Auth API using native AJAX-style requests.

The request encryption mirrors Airtel's bundled frontend:
  1. TripleDES encrypt the JSON payload with a UUID-derived key
  2. RSA encrypt that UUID with Airtel's public cert
  3. POST the resulting `key` payload to Airtel's bouncer endpoints
"""

import asyncio
import base64
import hashlib
import hmac
import json
import logging
import random
import time
import urllib.parse
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

LOGIN_URL = "https://www.airtel.in/manage-account/login"
NATIVE_BOUNCER_API_BASE = "https://myairtelapp.bsbportal.com/app/guardian/api/bouncer/v1"
NATIVE_CERT_URL = "https://assets.airtel.in/static-assets/airtel-lite/files/cert.pem"
NATIVE_GROUP_ID = "WEB_TOKEN_SHORTLIVED"
NATIVE_PUBLIC_KEY_PEM = """-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqlIbc/q+6Oq98WGysV+5
hws4RQ0Gpm/lgcN3sk29msY5fcd+DqxF76qJa84Uwtf3p4hD8dz5FODb5xHuYYGI
U17UhoTc/NAgKqoY6BHHgAilA89twm3CbpNOGfH0Vm9HDDr5TO/meCSRDyIKT43M
+weNQKp80DqmL09PJsy4Pe3EfceXjyysGEaaZ7QdX+F6TWq98bxvLS9WtJJ6n6hQ
QNpYvx+EHgBgZrDwHvHCeXOr7PuRu8Z6WquZAoFueCELn+yJcDrUzOGSLu7NnuFB
1u2HzcE5J0LzHG9+rozF/mwcKHVV6VVFRhEC7j7jVbtbKOFqwM1tTkRtMerbnzZU
oQIDAQAB
-----END PUBLIC KEY-----"""


class AirtelAPIError(RuntimeError):
    """Raised when Airtel rejects a request with a business-level error."""

    def __init__(self, message: str, *, status_code: int = 400, response: Optional[dict] = None):
        super().__init__(message)
        self.status_code = status_code
        self.response = response or {}


class AirtelSession:
    """Holds per-number Airtel auth state."""

    def __init__(self):
        self.auth_token: Optional[str] = None
        self.static_token: Optional[str] = None
        self.dynamic_token: Optional[str] = None
        self.uid: Optional[str] = None
        self.cookies: dict[str, str] = {}
        self.send_otp_response: Optional[dict] = None
        self.verify_otp_response: Optional[dict] = None

    def close(self) -> None:
        return None


class AirtelAuthAPI:
    """Airtel authentication client using native HTTP requests."""

    def __init__(self):
        self.sessions: dict[str, AirtelSession] = {}
        self._executor = ThreadPoolExecutor(max_workers=4)
        self._native_public_key: Optional[str] = None

    @staticmethod
    def _native_headers() -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "x-client": "map",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://www.airtel.in",
            "Referer": LOGIN_URL,
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/145.0.0.0 Safari/537.36"
            ),
        }

    @staticmethod
    def _send_otp_payload(mobile_number: str) -> dict[str, str]:
        return {
            "msisdn": mobile_number,
            "otpDigitCount": 4,
            "os": "WEB",
            "groupId": NATIVE_GROUP_ID,
        }

    @staticmethod
    def _verify_otp_payload(mobile_number: str, otp: str) -> dict[str, str]:
        return {
            "msisdn": mobile_number,
            "otpDigitCount": 4,
            "dynamicTokenRequired": True,
            "otp": otp,
            "os": "WEB",
            "groupId": NATIVE_GROUP_ID,
        }

    def _get_native_public_key(self) -> str:
        """Use the same certificate source as Airtel's frontend, with a static fallback."""
        if self._native_public_key:
            return self._native_public_key

        try:
            with httpx.Client(http2=True, timeout=10) as client:
                response = client.get(NATIVE_CERT_URL)
                response.raise_for_status()
                cert = response.text.strip()
                if cert.startswith("-----BEGIN PUBLIC KEY-----"):
                    self._native_public_key = cert
                    return cert
                logger.warning("Fetched Airtel certificate was not a PEM public key. Falling back.")
        except Exception as exc:
            logger.warning("Failed to fetch Airtel certificate from asset URL: %s", exc)

        self._native_public_key = NATIVE_PUBLIC_KEY_PEM
        return self._native_public_key

    @staticmethod
    def _js_compatible_uuid() -> str:
        """Close enough to the frontend UUID generator for the encryption key material."""
        return str(uuid.uuid4())

    @staticmethod
    def _triple_des_encrypt(plaintext: str, key_material: str) -> str:
        """Match CryptoJS TripleDES with the first 24 UTF-8 bytes of the UUID."""
        from Crypto.Cipher import DES3
        from Crypto.Util.Padding import pad

        key_bytes = key_material.encode("utf-8")[:24]
        cipher_3des = DES3.new(key_bytes, DES3.MODE_ECB)
        encrypted = cipher_3des.encrypt(pad(plaintext.encode("utf-8"), DES3.block_size))
        return base64.b64encode(encrypted).decode("utf-8")

    @staticmethod
    def _des_decrypt(ciphertext: str, key_material: str) -> str:
        from Crypto.Cipher import DES
        from Crypto.Util.Padding import unpad

        key_bytes = key_material.encode("utf-8")[:8]
        cipher = DES.new(key_bytes, DES.MODE_ECB)
        plaintext = cipher.decrypt(base64.b64decode(ciphertext.strip('"')))
        return unpad(plaintext, DES.block_size).decode("utf-8")

    @staticmethod
    def _generate_ads_header() -> str:
        now = time.localtime()
        millis = int((time.time() % 1) * 1000)
        parts = [
            now.tm_year,
            now.tm_mon - 1,
            now.tm_mday,
            now.tm_hour,
            now.tm_min,
            now.tm_sec,
            millis,
        ]
        seed = "".join(str(part) for part in parts) + str(random.random()).replace(".", "")
        return hashlib.sha1(seed.encode("utf-8")).hexdigest()

    def _build_native_request_key(self, payload: dict) -> dict[str, str]:
        """
        Mirror the Airtel web bundle flow:
        1. createUUID()
        2. TripleDES.encrypt(JSON.stringify(payload), Utf8.parse(uuid), ECB/Pkcs7)
        3. TripleDES.encrypt(Date.now().toString(), Utf8.parse(uuid), ECB/Pkcs7)
        4. RSA encrypt the UUID with the frontend cert.pem
        """
        from Crypto.Cipher import PKCS1_v1_5
        from Crypto.PublicKey import RSA

        payload_json = json.dumps(payload, separators=(",", ":"))
        timestamp = str(int(time.time() * 1000))
        rsa_key = RSA.import_key(self._get_native_public_key())
        cipher_rsa = PKCS1_v1_5.new(rsa_key)
        request_uuid = self._js_compatible_uuid()
        b64_payload = self._triple_des_encrypt(payload_json, request_uuid)
        b64_timestamp = self._triple_des_encrypt(timestamp, request_uuid)
        b64_uuid = base64.b64encode(cipher_rsa.encrypt(request_uuid.encode("utf-8"))).decode("utf-8")

        inner_str = (
            f"data={urllib.parse.quote(b64_payload, safe='')}"
            f"&key={urllib.parse.quote(b64_uuid, safe='')}"
            f"&timestamp={urllib.parse.quote(b64_timestamp, safe='')}"
        )

        return {"key": inner_str}

    def _require_session(self, mobile_number: str) -> AirtelSession:
        session = self.sessions.get(mobile_number)
        if session is None:
            raise ValueError("No active session. Call send_otp first.")
        return session

    @staticmethod
    def _is_success_response(resp_data: dict) -> bool:
        if resp_data.get("success") is True:
            return True
        if resp_data.get("status") == "success":
            return True
        return resp_data.get("data", {}).get("success") is True

    def _sync_send_otp(self, mobile_number: str) -> dict:
        """Send OTP using Airtel's native AJAX encryption flow."""
        logger.info("Starting native send_otp flow for %s", mobile_number)

        if mobile_number in self.sessions:
            self.sessions[mobile_number].close()
            del self.sessions[mobile_number]

        body_payload = self._build_native_request_key(self._send_otp_payload(mobile_number))
        url = f"{NATIVE_BOUNCER_API_BASE}/sendOtp"

        with httpx.Client(http2=True, timeout=15) as client:
            resp = client.post(url, headers=self._native_headers(), json=body_payload)
            cookies = dict(client.cookies.items())

        try:
            resp_data = resp.json()
        except Exception as exc:
            raise RuntimeError(f"Airtel native sendOtp returned non-JSON response: {resp.text[:200]}") from exc

        if resp.status_code != 200 or not self._is_success_response(resp_data):
            raise AirtelAPIError(
                f"Airtel native sendOtp rejected request. Status: {resp.status_code}, Body: {resp_data}",
                status_code=400 if resp.status_code == 200 else resp.status_code,
                response=resp_data,
            )

        session = AirtelSession()
        session.send_otp_response = resp_data
        session.cookies = cookies
        self.sessions[mobile_number] = session

        return {
            "status": "otp_sent",
            "mobile_number": mobile_number,
            "api_response": resp_data,
            "mode": "native_httpx",
        }

    def _sync_verify_otp(self, mobile_number: str, otp: str) -> dict:
        """Verify OTP using Airtel's native AJAX encryption flow."""
        session = self._require_session(mobile_number)
        logger.info("Starting native verify_otp flow for %s", mobile_number)

        body_payload = self._build_native_request_key(self._verify_otp_payload(mobile_number, otp))
        url = f"{NATIVE_BOUNCER_API_BASE}/verifyOtp"

        with httpx.Client(http2=True, timeout=15, cookies=session.cookies) as client:
            resp = client.post(url, headers=self._native_headers(), json=body_payload)
            updated_cookies = dict(client.cookies.items())

        try:
            resp_data = resp.json()
        except Exception as exc:
            raise RuntimeError(f"Airtel native verifyOtp returned non-JSON response: {resp.text[:200]}") from exc

        if resp.status_code != 200 or not self._is_success_response(resp_data):
            return {
                "status": "otp_failed",
                "mobile_number": mobile_number,
                "error": resp_data.get("errorMsg", "Unknown error"),
                "raw_response": resp_data,
                "mode": "native_httpx",
            }

        inner_data = resp_data.get("data", {}).get("data", {})
        session.verify_otp_response = resp_data
        session.cookies = updated_cookies
        session.static_token = inner_data.get("staticToken") or resp_data.get("data", {}).get("staticToken")
        session.auth_token = (
            session.static_token
            or inner_data.get("uid")
            or resp_data.get("data", {}).get("uid")
        )
        session.dynamic_token = (
            inner_data.get("dynamicToken")
            or resp_data.get("data", {}).get("dynamicToken")
        )
        session.uid = inner_data.get("uid") or resp_data.get("data", {}).get("uid")

        return {
            "status": "otp_verified",
            "mobile_number": mobile_number,
            "auth_token": session.auth_token,
            "static_token": session.static_token,
            "dynamic_token": session.dynamic_token,
            "uid": session.uid,
            "token_source": "native_api_response",
            "verify_response": resp_data,
            "cookies": session.cookies,
            "mode": "native_httpx",
        }

    @staticmethod
    def _build_utkn(method: str, url: str, params: dict[str, str], uid: str, static_token: str) -> str:
        query = urllib.parse.urlencode(params)
        path = urllib.parse.urlparse(url).path
        data_string = f"{method.upper()}{path}"
        if query:
            data_string += f"?{query}"
        digest = hmac.new(static_token.encode("utf-8"), data_string.encode("utf-8"), hashlib.sha1).digest()
        return f"{uid}:{base64.b64encode(digest).decode('utf-8')}"

    def _sync_get_profile(self, mobile_number: str) -> dict:
        """Fetch Airtel profile data using the verified session tokens."""
        session = self._require_session(mobile_number)

        try:
            static_token = session.static_token
            dynamic_token = session.dynamic_token
            uid = session.uid
            cookie_dict = session.cookies

            if not static_token or not dynamic_token or not uid:
                raise ValueError("Missing Airtel auth tokens. Call verify_otp successfully first.")

            profile_url = (
                "https://digi-api.airtel.in/app/wl-service/airtel-digital-profile/"
                "rest/customer/profile/v1/product/detail/fetch"
            )
            profile_params = {
                "lob": "MOBILITY",
                "siNumber": mobile_number,
                "skipCrmDetails": "true",
            }
            did = str(random.randint(10000, 99999))
            ads_header = self._generate_ads_header()
            headers = {
                "Accept": "application/json, text/plain, */*",
                "requesterId": "WEB",
                "x-client": "map",
                "x-at-client": "WEB",
                "x-at-application": "selfcare",
                "x-bsy-did": did,
                "x-bsy-os": "WEB",
                "X-Consumer-Name": "AirtelIn",
                "googleCookie": "airtel.com",
                "adsHeader": ads_header,
                "Origin": "https://www.airtel.in",
                "Referer": "https://www.airtel.in/",
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/145.0.0.0 Safari/537.36"
                ),
                "x-bsy-utkn": self._build_utkn("GET", profile_url, profile_params, uid, static_token),
                "x-bsy-dt": dynamic_token,
            }

            with httpx.Client(http2=True, timeout=15) as client:
                resp = client.get(profile_url, params=profile_params, headers=headers, cookies=cookie_dict)

            if resp.status_code == 200:
                google_cookie = resp.headers.get("googlecookie") or resp.headers.get("googleCookie")
                profile_payload: object
                if google_cookie:
                    profile_payload = json.loads(self._des_decrypt(resp.text, google_cookie))
                else:
                    try:
                        profile_payload = resp.json()
                    except Exception:
                        profile_payload = resp.text
                return {
                    "status": "success",
                    "source": "native_api_request",
                    "http_status": resp.status_code,
                    "profile": profile_payload,
                }

            logger.error("Profile API failed for %s: HTTP %s", mobile_number, resp.status_code)
            return {
                "error": "API returned non-200 status",
                "status": resp.status_code,
                "response_text": resp.text[:500],
            }
        except Exception as exc:
            logger.error("Failed to fetch profile natively for %s: %s", mobile_number, exc, exc_info=True)
            return {"error": str(exc), "status": 500}

    async def send_otp(self, mobile_number: str) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self._executor, self._sync_send_otp, mobile_number)

    async def verify_otp(self, mobile_number: str, otp: str) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self._executor, self._sync_verify_otp, mobile_number, otp)

    async def get_profile(self, mobile_number: str) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self._executor, self._sync_get_profile, mobile_number)

    async def close(self) -> None:
        self.sessions.clear()
        self._executor.shutdown(wait=False)


airtel_client = AirtelAuthAPI()

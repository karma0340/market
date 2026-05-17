import base64
import json
from dataclasses import dataclass
from typing import Optional

import httpx
from Crypto.Cipher import AES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad
from Crypto.Hash import SHA1


@dataclass
class VISession:
    cookies: httpx.Cookies
    circle: str
    circle_id: str
    is_migrated: str
    lob: str
    brand: str


class VIAuthAPI:
    """VI login/profile client using the discovered browser crypto flow."""

    BASE_URL = "https://www.myvi.in"
    LOGIN_PAGE_URL = f"{BASE_URL}/account/login"
    REGISTER_PAGE_URL = f"{BASE_URL}/register-mobile-number-and-email-id"
    VALIDATE_NUMBER_URL = f"{BASE_URL}/bin/selected/aolnumbervalidation"
    ALT_VALIDATE_NUMBER_URL = f"{BASE_URL}/bin/selected/dxlnumbervalidation"
    SEND_OTP_URL = f"{BASE_URL}/bin/vodafoneideadigital/dxlSendOtpServletTemp"
    ALT_SEND_OTP_URL = f"{BASE_URL}/bin/vodafoneideadigital/dxlSendOtpServlet"
    VERIFY_OTP_URL = f"{BASE_URL}/bin/vodafoneideadigital/dxlSelfCareOtpValidateServlet"
    PROFILE_URL = f"{BASE_URL}/bin/vodafoneideadigital/selfcare/dxlFetchUserDetailsServlet"
    EMAIL_ALT_VERIFY_URL = f"{BASE_URL}/bin/vodafoneideadigital/dxlemailaltnumberverifyservlet"
    SESSION_CHECK_URL = f"{BASE_URL}/bin/vodafoneideadigital/selfcare/SessionCheckServlet"

    DEFAULT_HEADERS = {
        "Accept": "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": BASE_URL,
        "Referer": LOGIN_PAGE_URL,
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/146.0.0.0 Safari/537.36"
        ),
        "X-Requested-With": "XMLHttpRequest",
    }

    def __init__(self):
        self.sessions: dict[str, VISession] = {}
        self.alt_sessions: dict[str, VISession] = {}

    async def _new_client(self, cookies: Optional[httpx.Cookies] = None) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            headers=self.DEFAULT_HEADERS,
            cookies=cookies or httpx.Cookies(),
            follow_redirects=False,
            http2=True,
            timeout=20,
        )

    @staticmethod
    def _encrypt_vars(plaintext: str) -> dict[str, str]:
        salt = get_random_bytes(16)
        iv = get_random_bytes(16)
        secret_passphrase = get_random_bytes(16)
        key = PBKDF2(secret_passphrase.hex(), salt, dkLen=16, count=100, hmac_hash_module=SHA1)
        cipher = AES.new(key, AES.MODE_CBC, iv=iv)
        encrypted = cipher.encrypt(pad(plaintext.encode("utf-8"), AES.block_size))
        return {
            "params": base64.b64encode(encrypted).decode("utf-8").replace("+", "%2B"),
            "sl": salt.hex(),
            "algf": iv.hex(),
            "sps": secret_passphrase.hex(),
        }

    @staticmethod
    def _form_body(field: str, payload: dict[str, str]) -> str:
        return f"{field}={json.dumps(payload, separators=(',', ':'))}"

    async def _bootstrap(self, client: httpx.AsyncClient) -> None:
        await client.get(self.LOGIN_PAGE_URL)

    async def _bootstrap_register(self, client: httpx.AsyncClient) -> None:
        await client.get(self.REGISTER_PAGE_URL)

    async def _validate_number(self, mobile_number: str, client: httpx.AsyncClient) -> dict:
        payload = {"mobNumber": mobile_number, "identifier": "myAccount"}
        encrypted = self._encrypt_vars(json.dumps(payload, separators=(",", ":")))
        response = await client.post(
            self.VALIDATE_NUMBER_URL,
            content=self._form_body("mobile", encrypted),
        )
        response.raise_for_status()
        data = response.json()
        if data.get("STATUS") != "SUCCESS":
            raise RuntimeError(f"VI number validation failed: {data}")
        return data

    async def _validate_number_alt(self, mobile_number: str, client: httpx.AsyncClient) -> dict:
        payload = {"mobNumber": mobile_number, "identifier": "ProfileUpdate"}
        encrypted = self._encrypt_vars(json.dumps(payload, separators=(",", ":")))
        response = await client.post(
            self.ALT_VALIDATE_NUMBER_URL,
            content=self._form_body("mobile", encrypted),
            headers={**self.DEFAULT_HEADERS, "Referer": self.REGISTER_PAGE_URL},
        )
        response.raise_for_status()
        data = response.json()
        if data.get("STATUS") != "SUCCESS":
            raise RuntimeError(f"VI2 number validation failed: {data}")
        return data

    async def send_otp(self, mobile_number: str) -> dict:
        async with await self._new_client() as client:
            await self._bootstrap(client)
            validation = await self._validate_number(mobile_number, client)

            payload = {
                "mobNumber": mobile_number,
                "use-case": "login",
                "circle": validation["circle"],
                "provider": validation["brand"].upper(),
                "circleId": validation["circleId"],
                "isMigrated": validation["isMigrated"],
                "lob": validation["subscriberType"],
            }
            encrypted = self._encrypt_vars(json.dumps(payload, separators=(",", ":")))
            response = await client.post(
                self.SEND_OTP_URL,
                content=self._form_body("userDetails", encrypted),
            )
            response.raise_for_status()
            data = response.json()
            if data.get("STATUS") != "SUCCESS":
                raise RuntimeError(f"VI send OTP failed: {data}")

            self.sessions[mobile_number] = VISession(
                cookies=client.cookies,
                circle=validation["circle"],
                circle_id=validation["circleId"],
                is_migrated=validation["isMigrated"],
                lob=validation["subscriberType"],
                brand=validation["brand"],
            )
            return {
                "status": "otp_sent",
                "mobile_number": mobile_number,
                "validation": validation,
                "send_otp_response": data,
            }

    async def popup_send_otp(self, mobile_number: str) -> dict:
        """Popup login flow. Same crypto and endpoints, isolated route name for compatibility."""
        result = await self.send_otp(mobile_number)
        result["mode"] = "popup"
        return result

    def _require_session(self, mobile_number: str) -> VISession:
        session = self.sessions.get(mobile_number)
        if session is None:
            raise ValueError("No active VI session. Call send_otp first.")
        return session

    def _require_alt_session(self, mobile_number: str) -> VISession:
        session = self.alt_sessions.get(mobile_number)
        if session is None:
            raise ValueError("No active VI2 session. Call send_otp first.")
        return session

    async def alt_send_otp(self, mobile_number: str) -> dict:
        """Profile-update/register-mobile flow. Leaves the original VI flow untouched."""
        async with await self._new_client() as client:
            await self._bootstrap_register(client)
            validation = await self._validate_number_alt(mobile_number, client)

            payload = {
                "mobNumber": mobile_number,
                "use-case": "login",
                "circle": validation["circle"],
                "provider": validation["brand"].upper(),
                "circleId": validation["circleId"],
                "isMigrated": validation["isMigrated"],
                "lob": validation["subscriberType"],
            }
            encrypted = self._encrypt_vars(json.dumps(payload, separators=(",", ":")))
            response = await client.post(
                self.ALT_SEND_OTP_URL,
                content=self._form_body("userDetails", encrypted),
                headers={**self.DEFAULT_HEADERS, "Referer": self.REGISTER_PAGE_URL},
            )
            response.raise_for_status()
            data = response.json()
            if data.get("STATUS") != "SUCCESS":
                raise RuntimeError(f"VI2 send OTP failed: {data}")

            self.alt_sessions[mobile_number] = VISession(
                cookies=client.cookies,
                circle=validation["circle"],
                circle_id=validation["circleId"],
                is_migrated=validation["isMigrated"],
                lob=validation["subscriberType"],
                brand=validation["brand"],
            )
            return {
                "status": "otp_sent",
                "mobile_number": mobile_number,
                "validation": validation,
                "send_otp_response": data,
                "mode": "vi2",
            }

    async def alt_verify_otp(self, mobile_number: str, otp: str) -> dict:
        session = self._require_alt_session(mobile_number)
        async with await self._new_client(session.cookies) as client:
            payload = {
                "otp": otp,
                "mobNumber": mobile_number,
                "circle": session.circle,
                "brand": session.brand,
                "use-case": "login",
                "isMigrated": session.is_migrated,
                "lob": session.lob,
                "circleId": session.circle_id,
            }
            encrypted = self._encrypt_vars(json.dumps(payload, separators=(",", ":")))
            response = await client.post(
                self.VERIFY_OTP_URL,
                content=self._form_body("userDetails", encrypted),
                headers={**self.DEFAULT_HEADERS, "Referer": self.REGISTER_PAGE_URL},
            )

            session.cookies = client.cookies

            if response.status_code == 302:
                return {
                    "status": "otp_verified",
                    "mobile_number": mobile_number,
                    "redirect_url": response.headers.get("Location"),
                    "cookies": dict(client.cookies.items()),
                    "mode": "vi2",
                }

            text = response.text
            try:
                data = response.json()
            except Exception:
                data = {"raw_response": text}

            if isinstance(data, dict) and data.get("STATUS") == "SUCCESS":
                return {
                    "status": "otp_verified",
                    "mobile_number": mobile_number,
                    "verify_response": data,
                    "cookies": dict(client.cookies.items()),
                    "mode": "vi2",
                }

            return {
                "status": "otp_failed",
                "mobile_number": mobile_number,
                "verify_response": data,
                "http_status": response.status_code,
                "mode": "vi2",
            }

    async def alt_session_check(self, mobile_number: Optional[str] = None) -> dict:
        cookies = (
            self.alt_sessions.get(mobile_number).cookies
            if mobile_number and mobile_number in self.alt_sessions
            else httpx.Cookies()
        )
        async with await self._new_client(cookies) as client:
            response = await client.post(
                self.SESSION_CHECK_URL,
                headers={**self.DEFAULT_HEADERS, "Referer": self.REGISTER_PAGE_URL},
                content="",
            )
            text = response.text
            try:
                data = response.json()
            except Exception:
                data = {"raw_response": text}
            return {
                "status": "success",
                "mobile_number": mobile_number,
                "session_check": data,
                "http_status": response.status_code,
                "mode": "vi2",
            }

    async def verify_otp(self, mobile_number: str, otp: str) -> dict:
        session = self._require_session(mobile_number)
        async with await self._new_client(session.cookies) as client:
            payload = {
                "otp": otp,
                "mobNumber": mobile_number,
                "circle": session.circle,
                "brand": session.brand,
                "use-case": "login",
                "isMigrated": session.is_migrated,
                "lob": session.lob,
                "circleId": session.circle_id,
            }
            encrypted = self._encrypt_vars(json.dumps(payload, separators=(",", ":")))
            response = await client.post(
                self.VERIFY_OTP_URL,
                content=self._form_body("userDetails", encrypted),
            )

            session.cookies = client.cookies

            if response.status_code == 302:
                return {
                    "status": "otp_verified",
                    "mobile_number": mobile_number,
                    "redirect_url": response.headers.get("Location"),
                    "cookies": dict(client.cookies.items()),
                }

            text = response.text
            try:
                data = response.json()
            except Exception:
                data = {"raw_response": text}

            if isinstance(data, dict) and data.get("STATUS") == "SUCCESS":
                return {
                    "status": "otp_verified",
                    "mobile_number": mobile_number,
                    "verify_response": data,
                    "cookies": dict(client.cookies.items()),
                }

            return {
                "status": "otp_failed",
                "mobile_number": mobile_number,
                "verify_response": data,
                "http_status": response.status_code,
            }

    async def popup_verify_otp(self, mobile_number: str, otp: str) -> dict:
        """Popup login flow verify. Keeps old VI routes unchanged."""
        result = await self.verify_otp(mobile_number, otp)
        result["mode"] = "popup"
        return result

    async def get_profile(self, mobile_number: str) -> dict:
        session = self._require_session(mobile_number)
        async with await self._new_client(session.cookies) as client:
            response = await client.post(
                self.PROFILE_URL,
                headers={**self.DEFAULT_HEADERS, "Referer": f"{self.BASE_URL}/selfcare/prepaid-dashboard"},
                content="",
            )
            response.raise_for_status()
            data = response.json()
            session.cookies = client.cookies
            return {
                "status": "success",
                "mobile_number": mobile_number,
                "profile": data,
            }

    async def get_email_alt_number_details(self, mobile_number: str, encrypted_user_details: str) -> dict:
        session = self._require_session(mobile_number)
        async with await self._new_client(session.cookies) as client:
            response = await client.post(
                self.EMAIL_ALT_VERIFY_URL,
                headers={
                    **self.DEFAULT_HEADERS,
                    "Referer": f"{self.BASE_URL}/register-mobile-number-and-email-id",
                },
                content=f"userDetails={encrypted_user_details}",
            )
            response.raise_for_status()
            session.cookies = client.cookies
            return {
                "status": "success",
                "mobile_number": mobile_number,
                "details": response.json(),
            }

    async def alt_get_email_alt_number_details(
        self,
        mobile_number: str,
        otp: Optional[str] = None,
        encrypted_user_details: Optional[str] = None,
    ) -> dict:
        session = self._require_alt_session(mobile_number)
        async with await self._new_client(session.cookies) as client:
            if encrypted_user_details is None:
                if not otp:
                    raise ValueError("Either otp or encrypted_user_details is required.")
                payload = {
                    "mobNumber": mobile_number,
                    "lob": session.lob,
                    "circle": session.circle,
                    "brand": session.brand,
                    "circleId": session.circle_id,
                    "use-case": "login",
                    "isMigrated": session.is_migrated,
                    "circleName": session.circle,
                    "otp": otp,
                }
                encrypted_user_details = json.dumps(
                    self._encrypt_vars(json.dumps(payload, separators=(",", ":"))),
                    separators=(",", ":"),
                )
            response = await client.post(
                self.EMAIL_ALT_VERIFY_URL,
                headers={
                    **self.DEFAULT_HEADERS,
                    "Referer": self.REGISTER_PAGE_URL,
                },
                content=f"userDetails={encrypted_user_details}",
            )
            response.raise_for_status()
            session.cookies = client.cookies
            return {
                "status": "success",
                "mobile_number": mobile_number,
                "details": response.json(),
                "mode": "vi2",
            }

    async def popup_session_check(self, mobile_number: Optional[str] = None) -> dict:
        cookies = self.sessions.get(mobile_number).cookies if mobile_number and mobile_number in self.sessions else httpx.Cookies()
        async with await self._new_client(cookies) as client:
            response = await client.post(
                self.SESSION_CHECK_URL,
                headers={**self.DEFAULT_HEADERS, "Referer": self.LOGIN_PAGE_URL},
                content="",
            )
            text = response.text
            try:
                data = response.json()
            except Exception:
                data = {"raw_response": text}
            return {
                "status": "success",
                "mobile_number": mobile_number,
                "session_check": data,
                "http_status": response.status_code,
            }


vi_client = VIAuthAPI()

import httpx
from cachetools import LRUCache


class JioAuthAPI:
    """Async Jio authentication client using httpx."""

    BASE_URL = "https://www.jio.com"
    LOGIN_URL = f"{BASE_URL}/api/jio-login-service/login"
    AUTH_URL = f"{BASE_URL}/api/jio-authenticate-service/authenticate/authJsonData"
    PROFILE_URL = f"{BASE_URL}/api/jio-customerprofile-service/customerprofile/retrieveCustomer"

    DEFAULT_HEADERS = {
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="143", "Not A(Brand";v="24"',
        "Content-Type": "application/json",
        "Sec-Ch-Ua-Mobile": "?0",
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/143.0.0.0 Safari/537.36"
        ),
        "Accept": "*/*",
        "Origin": BASE_URL,
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": f"{BASE_URL}/selfcare/login/",
        "Accept-Encoding": "gzip, deflate, br",
        "Priority": "u=1, i",
        "Connection": "keep-alive",
    }

    def __init__(self, max_sessions: int = 10_000):
        # LRUCache auto-evicts oldest sessions when cap is hit
        self.sessions: LRUCache = LRUCache(maxsize=max_sessions)

    # ── internal helpers ──────────────────────────────────────────

    def _get_client(self, mobile_number: str) -> httpx.AsyncClient:
        cookies = self.sessions.get(mobile_number, httpx.Cookies())
        return httpx.AsyncClient(headers=self.DEFAULT_HEADERS, cookies=cookies)

    def _save_cookies(self, mobile_number: str, client: httpx.AsyncClient) -> None:
        self.sessions[mobile_number] = client.cookies

    def _require_session(self, mobile_number: str) -> None:
        if mobile_number not in self.sessions:
            raise ValueError("Session not found. Call send_otp first.")

    # ── public API ────────────────────────────────────────────────

    async def send_otp(self, mobile_number: str) -> dict:
        """Trigger OTP to the given Jio mobile number."""
        payload = {
            "mobileNumber": mobile_number,
            "loginFlowType": "MOBILE",
            "alternateNumber": "",
        }
        async with self._get_client(mobile_number) as client:
            response = await client.post(f"{self.LOGIN_URL}/sendOtp", json=payload)
            self._save_cookies(mobile_number, client)
            return response.json()

    async def validate_otp(self, mobile_number: str, otp: str) -> dict:
        """Validate the OTP received on the mobile number."""
        self._require_session(mobile_number)
        async with self._get_client(mobile_number) as client:
            response = await client.post(
                f"{self.LOGIN_URL}/validateOtp", json={"otp": otp}
            )
            self._save_cookies(mobile_number, client)
            return response.json()

    async def get_auth_json(self, mobile_number: str) -> dict:
        """Fetch full authentication session data."""
        self._require_session(mobile_number)
        async with self._get_client(mobile_number) as client:
            response = await client.get(self.AUTH_URL)
            self._save_cookies(mobile_number, client)
            return response.json()

    async def get_profile(self, mobile_number: str) -> dict:
        """Fetch verified customer profile."""
        self._require_session(mobile_number)
        async with self._get_client(mobile_number) as client:
            client.headers["Referer"] = f"{self.BASE_URL}/selfcare/dashboard/settings/"
            response = await client.get(self.PROFILE_URL)
            self._save_cookies(mobile_number, client)
            return response.json()


# Singleton instance
jio_client = JioAuthAPI()

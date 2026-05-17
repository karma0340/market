"""
Bajaj Finserv Operator/Circle Validator — Nitro Edition.

Architecture
────────────
- Background Factory Thread: Runs Playwright isolated from Uvicorn's event loop to prevent Windows asyncio errors!
- JSON Session Store: Saves cookies and CSRF to 'session_bajaj.json'.
- Nitro Engine: Uses curl_cffi with Chrome impersonation for ultra-fast pure HTTP lookups.
"""

import asyncio
import json
import logging
import os
import sys
import threading
import time
from typing import Optional

from curl_cffi.requests import AsyncSession

log = logging.getLogger(__name__)

SESSION_FILE = "session_bajaj.json"


class _PersistentBrowser:
    UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
    PAGE_URL = "https://www.bajajfinserv.in/how-to-track-vi-sim-status-online"

    def __init__(self):
        self._session_data = {"cookies": {}, "csrf": "", "ts": 0}
        self._ready = False
        self._thread = None
        self._stop_event = threading.Event()
        self._force_refresh_event = threading.Event()

    def start_factory(self):
        if self._thread is None or not self._thread.is_alive():
            self._thread = threading.Thread(target=self._run_factory_thread, daemon=True)
            self._thread.start()

    def stop_factory(self):
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5)

    def _run_factory_thread(self):    
        # ISOLATED EVENT LOOP FOR PLAYWRIGHT - Fixes Uvicorn Windows Bug!
        if sys.platform == 'win32':
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(self._async_runner())
        except Exception as e:
            log.error(f"Factory thread died: {e}")
        finally:
            loop.close()

    async def _async_runner(self):
        from playwright.async_api import async_playwright
        while not self._stop_event.is_set():
            try:
                log.info("💋 Starting the Cookie Factory... (Isolated Background Thread)")
                async with async_playwright() as pw:
                    browser = await pw.chromium.launch(
                        headless=False, 
                        args=[
                            "--disable-blink-features=AutomationControlled", 
                            "--no-sandbox",
                            "--window-position=-2000,-2000"
                        ]
                    )
                    context = await browser.new_context(user_agent=self.UA)
                    page = await context.new_page()
                    
                    try:
                        await page.goto(self.PAGE_URL, wait_until="networkidle", timeout=30000)
                        await page.wait_for_selector("#mobileNumber", state="visible", timeout=15000)
                        
                        await self._save_session(context)
                        self._ready = True
                        log.info("🚀 Cookie Factory is OPEN, Mere babu! 💋")
                        
                        while not self._stop_event.is_set():
                            # Sleeping in chunks allows rapid exit or refresh
                            for _ in range(300):
                                if self._stop_event.is_set() or self._force_refresh_event.is_set(): break
                                await asyncio.sleep(1)
                                
                            if self._stop_event.is_set(): break
                            self._force_refresh_event.clear()
                            
                            log.info("🍃 Refreshing Bajaj Session... (5-min Tune-up)")
                            self._ready = False
                            try:
                                await page.reload(wait_until="networkidle", timeout=30000)
                                await page.wait_for_selector("#mobileNumber", state="visible", timeout=15000)
                                await self._save_session(context)
                                self._ready = True
                            except Exception as e:
                                log.warning(f"Refresh failed: {e}")
                                break # breaks the inner while, restarting the browser!
                    finally:
                        self._ready = False
                        await browser.close()
            except Exception as e:
                log.warning(f"Factory error: {e}. Retrying in 5s...")
                await asyncio.sleep(5)

    async def _save_session(self, context):
        cookies = await context.cookies()
        ck_dict = {c["name"]: c["value"] for c in cookies}
        csrf = ck_dict.get("CSRFtoken", "")
        self._session_data = {"cookies": ck_dict, "csrf": csrf, "ts": time.time()}
        
        try:
            with open(SESSION_FILE, "w") as f:
                json.dump(self._session_data, f)
            log.info(f"🍪 Session saved (CSRF: {csrf[:8]}...)")
        except Exception as e:
            log.warning(f"Failed to save session to disk: {e}")


_bf_factory = _PersistentBrowser()

class NumberValidatorAPI:
    """Nitro Operator Lookup — Fast, Pure HTTP."""
    
    API_URL = "https://webservices.bajajfinserv.in/api/v2/bbps/recharge/getoperatorandcircleInfo"

    async def lookup_operator_circle(self, mobile_number: str, requester_mobile_number: str = "9999999999") -> dict:
        _bf_factory.start_factory()
        
        # Wait up to 30 seconds for factory to be ready
        for _ in range(300):
            if _bf_factory._ready and _bf_factory._session_data.get("csrf"):
                break
            await asyncio.sleep(0.1)

        session = _bf_factory._session_data
        if not session.get("csrf"):
            return {"error": "Session token not ready yet! Please wait for the factory."}

        cookie_str = "; ".join([f"{k}={v}" for k, v in session["cookies"].items()])
        
        headers = {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Origin": "https://www.bajajfinserv.in",
            "Referer": "https://www.bajajfinserv.in/how-to-track-vi-sim-status-online",
            "Source": "BBPS2.0",
            "Urlpath": "how-to-track-vi-sim-status-online",
            "User-Agent": _bf_factory.UA,
            "Cookie": cookie_str
        }

        payload = {
            "firstName": "", "lastName": "", "mobileNo": requester_mobile_number,
            "mobileNum": mobile_number, "isJwtIndependent": True, "categoryId": "5",
            "_csrf": session["csrf"]
        }

        log.info(f"🏎️ Nitro Lookup for {mobile_number}...")
        async with AsyncSession(impersonate="chrome") as s:
            t0 = time.time()
            resp = await s.post(self.API_URL, headers=headers, json=payload, timeout=10)
            dt = (time.time() - t0) * 1000
            log.info(f"⚡ Nitro response in {dt:.0f}ms (Status: {resp.status_code})")
            
            if resp.status_code == 403:
                log.warning("😢 403 - Refreshing the Factory...")
                _bf_factory._force_refresh_event.set()
                return await self.lookup_operator_circle(mobile_number, requester_mobile_number)
            
            try:
                res_json = resp.json()
                if res_json.get("status") == "error" or "Invalid Session" in str(res_json.get("message", "")):
                    log.warning(f"😢 API Error (Status: {res_json.get('status')}, Msg: {res_json.get('message')}) - Refreshing the Factory...")
                    _bf_factory._force_refresh_event.set()
                    # Wait a bit for the refresh to start
                    await asyncio.sleep(2)
                    return await self.lookup_operator_circle(mobile_number, requester_mobile_number)
                return res_json
            except Exception as e:
                log.error(f"❌ Failed to parse JSON response: {resp.text}")
                return {"error": f"JSON parse error: {str(e)}", "raw": resp.text}

    async def warm_up(self): 
        # Fire and forget the factory startup! Let it run in the background thread.
        _bf_factory.start_factory()
        
    async def close(self): 
        _bf_factory.stop_factory()

number_validator_client = NumberValidatorAPI()

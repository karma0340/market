# ISP Auth Verification API

A FastAPI server wrapping Jio, Airtel, VI, VI2, and number-validation flows.

## Features

- Jio: send OTP, validate OTP, fetch auth session, get profile
- Airtel: send OTP, verify OTP, get profile
- VI: login OTP flow and profile fetch
- VI2: profile-update OTP flow and details fetch
- Number Validator: lookup operator and circle details
- In-memory session and cookie management per mobile number

## Installation

```bash
pip install -r requirements.txt
```

## Running

```bash
python main.py
```

Or:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Swagger UI: `http://localhost:8000/docs`

For the browser interceptor tool, install Playwright browsers once:

```bash
python -m playwright install chromium
```

## API Endpoints

### Jio

| Method | Endpoint                             | Description          |
|--------|--------------------------------------|----------------------|
| POST   | `/api/jio/send-otp`                  | Trigger OTP          |
| POST   | `/api/jio/validate-otp`              | Validate OTP         |
| GET    | `/api/jio/auth-data/{mobile_number}` | Fetch auth session   |
| GET    | `/api/jio/profile/{mobile_number}`   | Get customer profile |

```bash
curl -X POST http://localhost:8000/api/jio/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "9XXXXXXXXX"}'
```

```bash
curl -X POST http://localhost:8000/api/jio/validate-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "9XXXXXXXXX", "otp": "123456"}'
```

```bash
curl http://localhost:8000/api/jio/profile/9XXXXXXXXX
```

### Airtel

| Method | Endpoint                              | Description             |
|--------|---------------------------------------|-------------------------|
| POST   | `/api/airtel/send-otp`                | Trigger OTP             |
| POST   | `/api/airtel/verify-otp`              | Verify OTP              |
| GET    | `/api/airtel/profile/{mobile_number}` | Fetch customer profile  |

```bash
curl -X POST http://localhost:8000/api/airtel/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "9XXXXXXXXX"}'
```

```bash
curl -X POST http://localhost:8000/api/airtel/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "9XXXXXXXXX", "otp": "1234"}'
```

```bash
curl http://localhost:8000/api/airtel/profile/9XXXXXXXXX
```

### Number Validator

| Method | Endpoint                       | Description                        |
|--------|--------------------------------|------------------------------------|
| POST   | `/api/number-validator/lookup` | Lookup operator and circle details |

```bash
curl -X POST http://localhost:8000/api/number-validator/lookup \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8278702508"}'
```

### VI

| Method | Endpoint                          | Description                 |
|--------|-----------------------------------|-----------------------------|
| POST   | `/api/vi/send-otp`                | Validate number and send OTP |
| POST   | `/api/vi/verify-otp`              | Verify OTP                  |
| GET    | `/api/vi/profile/{mobile_number}` | Fetch customer profile      |

```bash
curl -X POST http://localhost:8000/api/vi/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8308409889"}'
```

```bash
curl -X POST http://localhost:8000/api/vi/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8308409889", "otp": "1234"}'
```

```bash
curl http://localhost:8000/api/vi/profile/8308409889
```

### VI2

These routes map to `https://www.myvi.in/register-mobile-number-and-email-id`.

| Method | Endpoint                           | Description                                  |
|--------|------------------------------------|----------------------------------------------|
| POST   | `/api/vi2/send-otp`                | Validate number and send OTP                 |
| POST   | `/api/vi2/verify-otp`              | Verify OTP                                   |
| POST   | `/api/vi2/email-alt-details`       | Verify OTP and return name/address/email/alt-number details |
| POST   | `/api/vi2/session-check`           | Check VI2 session state                      |

VI2 first calls `/bin/selected/dxlnumbervalidation` with:

```json
{
  "mobNumber": "<mobile>",
  "identifier": "ProfileUpdate"
}
```

The validation response is then reused to build the encrypted send-otp and details payloads.

```bash
curl -X POST http://localhost:8000/api/vi2/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8308409889"}'
```

```bash
curl -X POST http://localhost:8000/api/vi2/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8308409889", "otp": "1234"}'
```

```bash
curl -X POST http://localhost:8000/api/vi2/email-alt-details \
  -H "Content-Type: application/json" \
  -d '{"mobile_number":"8308409889","otp":"1234"}'
```

```bash
curl -X POST http://localhost:8000/api/vi2/session-check \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8308409889"}'
```

### VI Popup

These are compatibility routes for the popup login flow.

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | `/api/vi-popup/send-otp`         | Popup flow send OTP      |
| POST   | `/api/vi-popup/verify-otp`       | Popup flow verify OTP    |
| POST   | `/api/vi-popup/session-check`    | Popup flow session check |

```bash
curl -X POST http://localhost:8000/api/vi-popup/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8308409889"}'
```

```bash
curl -X POST http://localhost:8000/api/vi-popup/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile_number": "8308409889", "otp": "1234"}'
```

## Universal Interceptor

Use the browser analyzer to inspect any site and capture requests, crypto usage, storage, cookies, and candidate JS bundles.

```bash
python tools/universal_interceptor.py https://example.com --pattern login --pattern auth --timeout 180 --output reports/example.json
```

```bash
python tools/universal_interceptor.py https://www.airtel.in/manage-account/login --pattern sendOtp --pattern verifyOtp --pattern profile --timeout 300 --output reports/airtel.json --save-js
```

The report JSON includes network matches, browser-side request hooks, crypto events, candidate scripts, browser state, and cookies.

## Project Structure

```text
ISP-auth-verification/
|-- main.py
|-- tools/
|   `-- universal_interceptor.py
|-- services/
|   |-- __init__.py
|   |-- jio_api.py
|   |-- airtel_api.py
|   |-- number_validator_api.py
|   `-- vi_api.py
|-- requirements.txt
`-- README.md
```

## Tech Stack

- FastAPI
- httpx
- cachetools
- pydantic
- pycryptodome

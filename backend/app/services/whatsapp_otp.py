import json
import logging
import os
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


logger = logging.getLogger(__name__)

FAST2SMS_SEND_URL = 'https://www.fast2sms.com/dev/bulkV2'


def _extract_indian_10digit(phone_number: str) -> str:
    """Strip country code and return 10-digit Indian mobile number."""
    digits = re.sub(r'[^\d]', '', phone_number.strip())
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]
    if len(digits) != 10:
        raise ValueError(f'Fast2SMS requires a 10-digit Indian mobile number. Got: {phone_number}')
    return digits



async def send_registration_otp_via_whatsapp(
    phone_number: str,
    otp_code: str,
    recipient_name: str,
    expiry_minutes: int,
) -> dict:
    provider = os.getenv('SMS_PROVIDER', 'dev').lower().strip()

    # ── DEV MODE ──────────────────────────────────────────────────────────
    # OTP is printed to the backend console instead of sending a real SMS.
    # Switch SMS_PROVIDER=fast2sms in .env when ready for production.
    if provider == 'dev':
        logger.info('='*60)
        logger.info('DEV MODE OTP | phone: %s | otp: %s', phone_number, otp_code)
        logger.info('='*60)
        return {
            'provider': 'dev',
            'sent': True,
            'destination': phone_number,
            'otp': otp_code,          # returned in response for easy dev testing
        }

    # ── FAST2SMS (PRODUCTION) ─────────────────────────────────────────────
    api_key = os.getenv('FAST2SMS_API_KEY', '').strip()
    if not api_key:
        raise RuntimeError('FAST2SMS_API_KEY is missing in environment variables')

    mobile = _extract_indian_10digit(phone_number)

    otp_message = (
        f'{otp_code} is your Chakra Jothidanilayam OTP. '
        f'Valid for {expiry_minutes} minutes. Do not share.'
    )

    body = json.dumps({
        'route': 'q',
        'message': otp_message,
        'language': 'english',
        'flash': 0,
        'numbers': mobile,
    }).encode('utf-8')

    request = Request(FAST2SMS_SEND_URL, data=body, method='POST')
    request.add_header('authorization', api_key)
    request.add_header('Content-Type', 'application/json')

    try:
        with urlopen(request, timeout=15) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except HTTPError as exc:
        error_message = 'Fast2SMS request failed'
        try:
            error_payload = json.loads(exc.read().decode('utf-8'))
            error_message = (
                error_payload.get('message')
                or (error_payload.get('data') or {}).get('message')
                or error_message
            )
        except Exception:
            pass
        raise ValueError(f'Fast2SMS error: {error_message}') from exc
    except URLError as exc:
        raise RuntimeError('Unable to reach Fast2SMS API. Check network connectivity') from exc

    if not payload.get('return'):
        raise ValueError(f'Fast2SMS rejected the request: {payload.get("message", "Unknown error")}')

    logger.info('Fast2SMS OTP sent to %s | request_id: %s', mobile, payload.get('request_id'))

    return {
        'provider': 'fast2sms',
        'sent': True,
        'destination': phone_number,
        'requestId': payload.get('request_id'),
    }


async def get_whatsapp_message_status(request_id: str) -> dict:
    """Fast2SMS does not have a status lookup API — return the request_id as reference."""
    return {
        'provider': 'fast2sms',
        'requestId': request_id,
        'note': 'Fast2SMS does not provide a delivery status API. Check Fast2SMS dashboard for delivery reports.',
    }

from datetime import datetime, timedelta, timezone
import hashlib
import os
import secrets
from uuid import uuid4
import re

import jwt
from bson import ObjectId
from pydantic import BaseModel, EmailStr, field_validator

from app.config.mongodb import db_state
from app.services.whatsapp_otp import get_whatsapp_message_status
from app.services.whatsapp_otp import send_registration_otp_via_whatsapp


OTP_TTL_MINUTES = 10


# user Registration
class RegisterUserPayload(BaseModel):
    name: str
    email: EmailStr
    phoneNumber: str
    password: str

    @field_validator('name')
    @classmethod
    def require_non_empty(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError('must not be empty')
        return normalized

    @field_validator('password')
    @classmethod
    def validate_password(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 8:
            raise ValueError('password must be at least 8 characters')
        return normalized

    @field_validator('phoneNumber')
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        return _normalize_phone_number(value)

def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000,
    ).hex()


def _normalize_phone_number(value: str) -> str:
    normalized = re.sub(r'[^\d+]', '', value.strip())
    if normalized.startswith('00'):
        normalized = f'+{normalized[2:]}'
    if not normalized.startswith('+'):
        raise ValueError('phoneNumber must include country code, for example +917402645726')

    digit_only = normalized[1:]
    if not digit_only.isdigit() or len(digit_only) < 10 or len(digit_only) > 15:
        raise ValueError('phoneNumber must be a valid phone number with country code')

    return normalized


def _generate_auth_tokens(user_id: str, login_method: str) -> dict:
    now = datetime.now(timezone.utc)
    issued_at = int(now.timestamp())
    expiry_seconds = int(os.getenv('JWT_ACCESS_TOKEN_TTL_SECONDS', '86400'))
    exp = issued_at + expiry_seconds

    issuer = os.getenv('JWT_ISSUER', 'chakra-jothidanilayam-api')
    audience = os.getenv('JWT_AUDIENCE', 'chakra-jothidanilayam-web')
    secret_key = os.getenv('JWT_SECRET', 'change-this-in-production')
    key_id = os.getenv('JWT_KID', secrets.token_hex(5))

    refresh_token_id = str(uuid4())

    payload = {
        'aud': audience,
        'exp': exp,
        'iat': issued_at,
        'iss': issuer,
        'sub': user_id,
        'jti': str(uuid4()),
        'authenticationType': login_method.upper(),
        'sid': refresh_token_id,
    }

    access_token = jwt.encode(payload, secret_key, algorithm='HS256', headers={'kid': key_id})
    refresh_token = secrets.token_urlsafe(40)

    return {
        'refreshToken': refresh_token,
        'refreshTokenId': refresh_token_id,
        'token': access_token,
        'tokenExpirationInstant': exp * 1000,
    }


def _generate_otp(length: int = 6) -> str:
    if length <= 0:
        raise ValueError('OTP length must be greater than zero')
    range_start = 10 ** (length - 1)
    range_end = (10**length) - 1
    return str(secrets.randbelow(range_end - range_start + 1) + range_start)


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode('utf-8')).hexdigest()


async def _store_registration_otp(phone_number: str, otp: str):
    now_utc = datetime.utcnow()
    expires_at = now_utc + timedelta(minutes=OTP_TTL_MINUTES)
    await db_state.db.UserOtpVerifications.update_one(
        {'phoneNumber': phone_number, 'purpose': 'register'},
        {
            '$set': {
                'otpHash': _hash_otp(otp),
                'expiresAt': expires_at,
                'updatedAt': now_utc,
            },
            '$setOnInsert': {
                'phoneNumber': phone_number,
                'purpose': 'register',
                'createdAt': now_utc,
            },
        },
        upsert=True,
    )


async def register_user(payload: RegisterUserPayload):
    if db_state.db is None:
        raise RuntimeError('Database is not connected')

    login_method = 'email'
    normalized_email = payload.email.lower().strip()
    normalized_phone_number = _normalize_phone_number(payload.phoneNumber)
    existing_user = await db_state.db.Users.find_one({'email': normalized_email}, {'_id': 1})
    if existing_user:
        raise ValueError('Email already registered')

    existing_phone = await db_state.db.Users.find_one({'phoneNumber': normalized_phone_number}, {'_id': 1})
    if existing_phone:
        raise ValueError('Phone number already registered')

    password_salt = secrets.token_hex(16)
    password_hash = _hash_password(payload.password, password_salt)
    now_iso = datetime.now(timezone.utc).isoformat()
    user_document = {
        'name': payload.name,
        'email': normalized_email,
        'phoneNumber': normalized_phone_number,
        'loginMethod': login_method,
        'passwordHash': password_hash,
        'passwordSalt': password_salt,
        'isVerified': False,
        'verifiedAt': None,
        'createdAt': now_iso,
    }

    result = await db_state.db.Users.insert_one(user_document)

    user_id = str(result.inserted_id)
    otp_code = _generate_otp()

    try:
        await _store_registration_otp(normalized_phone_number, otp_code)
        whatsapp_result = await send_registration_otp_via_whatsapp(
            phone_number=normalized_phone_number,
            otp_code=otp_code,
            recipient_name=payload.name,
            expiry_minutes=OTP_TTL_MINUTES,
        )
    except Exception as exc:
        await db_state.db.Users.delete_one({'_id': result.inserted_id})
        await db_state.db.UserOtpVerifications.delete_one(
            {'phoneNumber': normalized_phone_number, 'purpose': 'register'}
        )
        if isinstance(exc, (ValueError, RuntimeError)):
            raise
        raise RuntimeError('Failed to send WhatsApp OTP') from exc

    response = {
        'userId': user_id,
        'loginMethod': login_method,
        'name': payload.name,
        'email': normalized_email,
        'phoneNumber': normalized_phone_number,
        'isVerified': False,
        'requiresEmailVerification': True,
        'requiresPhoneVerification': True,
        'otpExpiresInMinutes': OTP_TTL_MINUTES,
        'otpDispatch': whatsapp_result,
    }

    return response


# Login user
class LoginUserPayload(BaseModel):
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def normalize_password(cls, value: str) -> str:
        return value.strip()


class VerifyOtpPayload(BaseModel):
    phoneNumber: str
    otp: str

    @field_validator('phoneNumber')
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        return _normalize_phone_number(value)

    @field_validator('otp')
    @classmethod
    def validate_otp(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized.isdigit() or len(normalized) != 6:
            raise ValueError('OTP must be a 6 digit number')
        return normalized


async def verify_registration_otp(payload: VerifyOtpPayload):
    if db_state.db is None:
        raise RuntimeError('Database is not connected')

    normalized_phone_number = _normalize_phone_number(payload.phoneNumber)
    user = await db_state.db.Users.find_one(
        {'phoneNumber': normalized_phone_number, 'passwordHash': {'$exists': True}, 'passwordSalt': {'$exists': True}}
    )
    if not user:
        raise ValueError('User not found')

    if user.get('isVerified'):
        return {
            'userId': str(user['_id']),
            'email': user.get('email'),
            'phoneNumber': normalized_phone_number,
            'isVerified': True,
            'message': 'User already verified',
        }

    otp_record = await db_state.db.UserOtpVerifications.find_one({'phoneNumber': normalized_phone_number, 'purpose': 'register'})
    if not otp_record:
        raise ValueError('OTP not found. Please register again to get a new OTP')

    now_utc = datetime.utcnow()
    expires_at = otp_record.get('expiresAt')
    # MongoDB returns naive UTC datetimes; compare using utcnow() to avoid
    # TypeError when mixing naive and timezone-aware datetime objects
    if expires_at is not None and hasattr(expires_at, 'tzinfo') and expires_at.tzinfo is not None:
        expires_at = expires_at.replace(tzinfo=None)
    if expires_at is None or expires_at <= now_utc:
        await db_state.db.UserOtpVerifications.delete_one({'_id': otp_record['_id']})
        raise ValueError('OTP expired. Please register again to get a new OTP')

    if _hash_otp(payload.otp) != otp_record.get('otpHash'):
        raise ValueError('Invalid OTP')

    await db_state.db.Users.update_one(
        {'_id': user['_id']},
        {'$set': {'isVerified': True, 'verifiedAt': now_utc.isoformat()}},
    )
    await db_state.db.UserOtpVerifications.delete_one({'_id': otp_record['_id']})

    return {
        'userId': str(user['_id']),
        'email': user.get('email'),
        'phoneNumber': normalized_phone_number,
        'isVerified': True,
        'requiresEmailVerification': False,
        'requiresPhoneVerification': False,
    }


async def fetch_registration_otp_status(message_sid: str):
    return await get_whatsapp_message_status(message_sid)

async def login_user(payload: LoginUserPayload):
    if db_state.db is None:
        raise RuntimeError('Database is not connected')

    normalized_email = payload.email.lower().strip()
    user = await db_state.db.Users.find_one(
        {'email': normalized_email, 'passwordHash': {'$exists': True}, 'passwordSalt': {'$exists': True}}
    )
    if not user:
        raise ValueError('Invalid email or password')

    password_hash = _hash_password(payload.password, user['passwordSalt'])
    if password_hash != user['passwordHash']:
        raise ValueError('Invalid email or password')

    if not user.get('isVerified', False):
        raise ValueError('Please verify OTP before login')

    tokens = _generate_auth_tokens(user_id=str(user['_id']), login_method=user['loginMethod'])
    await db_state.db.UserSessions.insert_one(
        {
            'userId': str(user['_id']),
            'loginMethod': user['loginMethod'],
            'accessToken': tokens['token'],
            'refreshToken': tokens['refreshToken'],
            'refreshTokenId': tokens['refreshTokenId'],
            'tokenExpirationInstant': tokens['tokenExpirationInstant'],
            'createdAt': datetime.now(timezone.utc).isoformat(),
             'name': user['name'],
        'email': normalized_email,
        'isVerified': user.get('isVerified', False),
        }
    )

    return {
        'userId': str(user['_id']),
        'loginMethod': user['loginMethod'],
        'refreshToken': tokens['refreshToken'],
        'refreshTokenId': tokens['refreshTokenId'],
        'tokenExpirationInstant': tokens['tokenExpirationInstant'],
        'access_token': tokens['token'],
        'refresh_token': tokens['refreshToken'],
        'name': user['name'],
        'email': normalized_email,
        'isVerified': user.get('isVerified', False),
    }

# change Password api

class ChangePasswordRequest(BaseModel):
    user_id: str
    current_password: str
    new_password: str

    @field_validator('user_id')
    @classmethod
    def validate_user_id(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError('User id is required')
        return normalized

    @field_validator('current_password')
    @classmethod
    def validate_current_password(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError('Current password is required')
        return normalized

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        password = value.strip()

        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")

        if not re.search(r"[A-Z]", password):
            raise ValueError("Password must contain at least one uppercase letter")

        if not re.search(r"[0-9]", password):
            raise ValueError("Password must contain at least one number")

        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
            raise ValueError("Password must contain at least one special character")

        return password


async def validate_new_password(payload: ChangePasswordRequest):
    if db_state.db is None:
        raise RuntimeError('Database is not connected')

    try:
        user_object_id = ObjectId(payload.user_id)
    except Exception as exc:
        raise ValueError('Invalid user id') from exc

    user = await db_state.db.Users.find_one(
        {'_id': user_object_id, 'passwordHash': {'$exists': True}, 'passwordSalt': {'$exists': True}}
    )
    if not user:
        raise ValueError('User not found')

    current_hash = _hash_password(payload.current_password, user['passwordSalt'])
    if current_hash != user['passwordHash']:
        raise ValueError('Current password is incorrect')

    if payload.current_password == payload.new_password:
        raise ValueError('New password must be different from current password')

    password_salt = secrets.token_hex(16)
    password_hash = _hash_password(payload.new_password, password_salt)

    await db_state.db.Users.update_one(
        {'_id': user_object_id},
        {
            '$set': {
                'passwordHash': password_hash,
                'passwordSalt': password_salt,
                'passwordUpdatedAt': datetime.now(timezone.utc).isoformat(),
            }
        },
    )

    return {'userId': payload.user_id}



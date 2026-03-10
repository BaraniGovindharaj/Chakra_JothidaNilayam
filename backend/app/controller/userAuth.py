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

# user Registration
class RegisterUserPayload(BaseModel):
    name: str
    email: EmailStr
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

def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000,
    ).hex()


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


async def register_user(payload: RegisterUserPayload):
    if db_state.db is None:
        raise RuntimeError('Database is not connected')

    login_method = 'email'
    normalized_email = payload.email.lower().strip()
    existing_user = await db_state.db.Users.find_one({'email': normalized_email}, {'_id': 1})
    if existing_user:
        raise ValueError('Email already registered')

    password_salt = secrets.token_hex(16)
    password_hash = _hash_password(payload.password, password_salt)
    user_document = {
        'name': payload.name,
        'email': normalized_email,
        'loginMethod': login_method,
        'passwordHash': password_hash,
        'passwordSalt': password_salt,
        'isVerified': True,
        'verifiedAt': datetime.now(timezone.utc).isoformat(),
        'createdAt': datetime.now(timezone.utc).isoformat(),
    }

    result = await db_state.db.Users.insert_one(user_document)

    user_id = str(result.inserted_id)
    tokens = _generate_auth_tokens(user_id=user_id, login_method=login_method)
    await db_state.db.Users.insert_one(
        {
            'userId': user_id,
            'loginMethod': login_method,
            'accessToken': tokens['token'],
            'refreshToken': tokens['refreshToken'],
            'refreshTokenId': tokens['refreshTokenId'],
            'tokenExpirationInstant': tokens['tokenExpirationInstant'],
            'createdAt': datetime.now(timezone.utc).isoformat(),
            'name': payload.name,
            'email': normalized_email,
            'isVerified': True,
        }
    )

    response = {
        'userId': user_id,
        'loginMethod': login_method,
        'refreshToken': tokens['refreshToken'],
        'refreshTokenId': tokens['refreshTokenId'],
        'tokenExpirationInstant': tokens['tokenExpirationInstant'],
        'access_token': tokens['token'],
        'refresh_token': tokens['refreshToken'],
        'name': payload.name,
        'email': normalized_email,
        'isVerified': True,
        'requiresEmailVerification': False,
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

async def login_user(payload: LoginUserPayload):
    if db_state.db is None:
        raise RuntimeError('Database is not connected')

    normalized_email = payload.email.lower().strip()
    user = await db_state.db.Users.find_one({'email': normalized_email})
    if not user:
        raise ValueError('Invalid email or password')

    password_hash = _hash_password(payload.password, user['passwordSalt'])
    if password_hash != user['passwordHash']:
        raise ValueError('Invalid email or password')

    tokens = _generate_auth_tokens(user_id=str(user['_id']), login_method=user['loginMethod'])
    await db_state.db.Users.insert_one(
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



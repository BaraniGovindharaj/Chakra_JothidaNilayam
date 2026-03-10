from datetime import datetime, timezone

from pydantic import BaseModel, field_validator
from pymongo import ReturnDocument

from app.config.mongodb import db_state


class ContactUsPayload(BaseModel):
    userName: str
    phoneNumber: str
    message: str
    userId: str | None = None

    @field_validator('userName', 'phoneNumber', 'message')
    @classmethod
    def require_non_empty(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError('must not be empty')
        return normalized

    @field_validator('userId')
    @classmethod
    def normalize_user_id(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized = value.strip()
        return normalized or None


async def save_contact_message(payload: ContactUsPayload):
    if db_state.db is None:
        raise RuntimeError('Database is not connected')

    message_document = {
        'userName': payload.userName,
        'phoneNumber': payload.phoneNumber,
        'message': payload.message,
        'createdAt': datetime.now(timezone.utc).isoformat(),
        'userId': payload.userId,
    }

    if payload.userId:
        saved = await db_state.db.contact_messages.find_one_and_replace(
            {'userId': payload.userId},
            message_document,
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

        if saved is None:
            raise RuntimeError('Failed to save message')

        saved['_id'] = str(saved['_id'])
        return saved

    result = await db_state.db.contact_messages.insert_one(message_document)
    message_document['_id'] = str(result.inserted_id)
    return message_document


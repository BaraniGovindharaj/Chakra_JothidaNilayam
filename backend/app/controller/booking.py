from datetime import datetime, timezone
from typing import Union

from pydantic import BaseModel, field_validator

from app.config.mongodb import db_state


class BookingPayload(BaseModel):
	date: datetime
	service: str
	time: str
	amount: Union[float, str]
	userId: str

	@field_validator('amount')
	@classmethod
	def normalize_amount(cls, value: Union[float, str]) -> float:
		if isinstance(value, (int, float)):
			return float(value)

		normalized = ''.join(ch for ch in value if ch.isdigit() or ch == '.')
		if not normalized:
			raise ValueError('amount must be a valid number')
		return float(normalized)


async def create_booking(payload: BookingPayload):
	if db_state.db is None:
		raise RuntimeError("Database is not connected")

	if payload.date.tzinfo is None:
		raise ValueError("date must include timezone (UTC preferred)")

	utc_date = payload.date.astimezone(timezone.utc)
	booking_document = {
		"date": utc_date.isoformat(),
		"service": payload.service,
		"time": payload.time,
		"createdAt": datetime.now(timezone.utc).isoformat(),
		"amount": payload.amount,
		"userId": payload.userId,
	}

	result = await db_state.db.bookings.insert_one(booking_document)
	booking_document["_id"] = str(result.inserted_id)
	return booking_document


async def get_bookings():
	if db_state.db is None:
		raise RuntimeError("Database is not connected")

	bookings = await db_state.db.bookings.find({}).to_list(length=200)
	for booking in bookings:
		booking["_id"] = str(booking["_id"])
	return bookings
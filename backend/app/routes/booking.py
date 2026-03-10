from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.controller.booking import BookingPayload, create_booking, get_bookings


router = APIRouter()


@router.post('/user-booking')
async def create_booking_request(payload: BookingPayload):
    try:
        booking = await create_booking(payload)
        return JSONResponse(
            status_code=201,
            content={
                "status_code": 201,
                "message": "Booking created successfully",
                "data": booking,
            },
        )
    except ValueError as exc:
        return JSONResponse(
            status_code=400,
            content={
                "status_code": 400,
                "message": str(exc),
                "data": None,
            },
        )
    except RuntimeError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status_code": 503,
                "message": str(exc),
                "data": None,
            },
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "status_code": 500,
                "message": f"Failed to create booking: {str(exc)}",
                "data": None,
            },
        )


@router.get('/booking')
async def fetch_bookings():
    try:
        bookings = await get_bookings()
        return JSONResponse(
            status_code=200,
            content={
                "status_code": 200,
                "message": "Bookings fetched successfully",
                "data": bookings,
            },
        )
    except RuntimeError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status_code": 503,
                "message": str(exc),
                "data": None,
            },
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                "status_code": 500,
                "message": f"Failed to fetch bookings: {str(exc)}",
                "data": None,
            },
        )

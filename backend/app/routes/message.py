from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.controller.Message import ContactUsPayload, save_contact_message


router = APIRouter()


@router.post('/contact-message')
async def save_contact_message_request(payload: ContactUsPayload):
    try:
        saved_message = await save_contact_message(payload)
        return JSONResponse(
            status_code=201,
            content={
                'status_code': 201,
                'message': 'Message saved successfully',
                'data': saved_message,
            },
        )
    except ValueError as exc:
        return JSONResponse(
            status_code=400,
            content={
                'status_code': 400,
                'message': str(exc),
                'data': None,
            },
        )
    except RuntimeError as exc:
        return JSONResponse(
            status_code=503,
            content={
                'status_code': 503,
                'message': str(exc),
                'data': None,
            },
        )
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={
                'status_code': 500,
                'message': f'Failed to save message: {str(exc)}',
                'data': None,
            },
        )

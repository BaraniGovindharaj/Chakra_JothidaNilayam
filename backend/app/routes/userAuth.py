from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.controller.userAuth import LoginUserPayload, login_user
from app.controller.userAuth import RegisterUserPayload, register_user
from app.controller.userAuth import fetch_registration_otp_status
from app.controller.userAuth import VerifyOtpPayload, verify_registration_otp
from app.controller.userAuth import ChangePasswordRequest, validate_new_password


router = APIRouter()


@router.post('/register')
async def register_user_request(payload: RegisterUserPayload):
    try:
        user = await register_user(payload)
        return JSONResponse(
            status_code=201,
            content={
                'status_code': 201,
                'message': 'User registered successfully',
                'data': user,
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
                'message': f'Failed to register user: {str(exc)}',
                'data': None,
            },
        )


@router.post('/login')
async def login_user_request(payload: LoginUserPayload):
    try:
        user = await login_user(payload)
        return JSONResponse(
            status_code=200,
            content={
                'status_code': 200,
                'message': 'User logged in successfully',
                'data': user,
            },
        )
    except ValueError as exc:
        return JSONResponse(
            status_code=401,
            content={
                'status_code': 401,
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
                'message': f'Failed to login user: {str(exc)}',
                'data': None,
            },
        )


@router.post('/verify-otp')
async def verify_otp_request(payload: VerifyOtpPayload):
    try:
        result = await verify_registration_otp(payload)
        return JSONResponse(
            status_code=200,
            content={
                'status_code': 200,
                'message': 'OTP verified successfully',
                'data': result,
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
                'message': f'Failed to verify OTP: {str(exc)}',
                'data': None,
            },
        )


@router.get('/otp-status/{message_sid}')
async def otp_status_request(message_sid: str):
    try:
        result = await fetch_registration_otp_status(message_sid)
        return JSONResponse(
            status_code=200,
            content={
                'status_code': 200,
                'message': 'OTP message status fetched successfully',
                'data': result,
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
                'message': f'Failed to fetch OTP status: {str(exc)}',
                'data': None,
            },
        )


# chnage password
@router.post('/change-password')
async def change_password_request(payload: ChangePasswordRequest):
    try:
        result = await validate_new_password(payload)
        return JSONResponse(
            status_code=200,
            content={
                'status_code': 200,
                'message': 'Password changed successfully',
                'data': result,
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
                'message': f'Failed to change password: {str(exc)}',
                'data': None,
            },
        )

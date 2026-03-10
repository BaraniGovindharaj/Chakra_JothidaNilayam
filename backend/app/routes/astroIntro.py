from fastapi import APIRouter, HTTPException
from app.controller.astroIntro import get_astro_intro
from app.controller.astroIntro import get_service_details

router = APIRouter()


@router.get('/home-content')
async def fetch_home_content():
    try:
        return await get_astro_intro()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch home content: {str(exc)}")
@router.get('/service-details')
async def fetch_service_details():
    try:
        return await get_service_details()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch service details: {str(exc)}")
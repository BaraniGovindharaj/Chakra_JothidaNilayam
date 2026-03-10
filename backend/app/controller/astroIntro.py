from app.database import db_state

async def get_astro_intro():
    try:
        docs = await db_state.db.astro.find({}, {"_id": 0}).to_list(length=100)
        if docs:
            return docs
    except Exception:
        return [];

async def get_service_details():
    try:
        docs = await db_state.db.astro.find({}, {"_id": 0, "servicesSection": 1}).to_list(length=100)
        if docs:
            return docs
    except Exception:
        return []
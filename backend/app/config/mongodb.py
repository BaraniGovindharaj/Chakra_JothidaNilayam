import os
import logging
from urllib.parse import quote_plus

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient


load_dotenv()
logger = logging.getLogger(__name__)


class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    def __init__(self):
        self.client = None
        self.db = None


db_state = MongoDB()


def _build_mongo_url(db_name: str) -> str:
    mongo_url = os.getenv("MONGO_URL")
    if mongo_url:
        return mongo_url

    mongo_host = os.getenv("MONGO_HOST")
    mongo_user = os.getenv("MONGO_USER")
    mongo_password = os.getenv("MONGO_PASSWORD")
    mongo_scheme = os.getenv("MONGO_SCHEME", "mongodb+srv")

    if not mongo_host:
        raise ValueError("Set either MONGO_URL or MONGO_HOST in environment variables.")

    if mongo_user and mongo_password:
        encoded_user = quote_plus(mongo_user)
        encoded_password = quote_plus(mongo_password)
        auth_source = os.getenv("MONGO_AUTH_SOURCE", db_name)
        return (
            f"{mongo_scheme}://{encoded_user}:{encoded_password}@{mongo_host}/{db_name}"
            f"?authSource={quote_plus(auth_source)}"
        )
    print("MongoDB URL: %s", f"{mongo_scheme}://{mongo_host}/{db_name}")

    return f"{mongo_scheme}://{mongo_host}/{db_name}"


async def connect_to_db():
    db_name = os.getenv("MONGODB_NAME")

    if not db_name:
        raise ValueError("MONGODB_NAME must be set in environment variables.")

    mongo_url = _build_mongo_url(db_name)
    print(f"MongoDB URL: {mongo_url}")
    using_split_config = not bool(os.getenv("MONGO_URL"))
    print(f"Connecting to MongoDB using {'split config' if using_split_config else 'full URL'}")


    db_state.client = AsyncIOMotorClient(mongo_url)
    db_state.db = db_state.client[db_name]
    logger.info("Successfully connected to MongoDB")


async def close_db_connection():
    if db_state.client:
        db_state.client.close()
        logger.info("MongoDB connection closed")

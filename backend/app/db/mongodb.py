from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global client, database

    if client is None:
        client = AsyncIOMotorClient(settings.mongodb_uri)
        database = client[settings.mongodb_db_name]


async def close_mongo_connection() -> None:
    global client, database

    if client is not None:
        client.close()
        client = None
        database = None


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError("Database connection has not been initialized.")
    return database


async def ensure_indexes() -> None:
    db = get_database()
    await db["users"].create_index("username", unique=True)
    await db["users"].create_index("email", unique=True)
    await db["movies"].create_index("title")
    await db["movies"].create_index("sections")
    await db["movies"].create_index("is_featured")


def serialize_object_id(value: Any) -> str:
    return str(value)


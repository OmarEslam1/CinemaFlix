from datetime import UTC, datetime
from pathlib import Path
import sys

from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.core.config import settings
from app.services.seed import MOVIE_SEED_DATA


async def seed_movies() -> None:
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db_name]

    now = datetime.now(UTC)
    documents = []
    for movie in MOVIE_SEED_DATA:
        documents.append(
            {
                **movie,
                "created_at": now,
                "updated_at": now,
            }
        )

    await db["movies"].delete_many({})
    if documents:
        await db["movies"].insert_many(documents)

    client.close()
    print(f"Seeded {len(documents)} movies into '{settings.mongodb_db_name}'.")


if __name__ == "__main__":
    import asyncio

    asyncio.run(seed_movies())

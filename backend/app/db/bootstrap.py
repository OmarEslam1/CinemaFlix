from datetime import UTC, datetime

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.mongodb import get_database


async def ensure_owner_account() -> None:
    db = get_database()
    now = datetime.now(UTC)

    existing_owner = await db["users"].find_one(
        {
            "$or": [
                {"username": settings.owner_username},
                {"email": settings.owner_email.lower()},
                {"is_owner": True},
            ]
        }
    )

    owner_payload = {
        "username": settings.owner_username,
        "email": settings.owner_email.lower(),
        "password": get_password_hash(settings.owner_password),
        "is_owner": True,
        "wishlist_movie_ids": existing_owner.get("wishlist_movie_ids", existing_owner.get("favorite_movie_ids", []))
        if existing_owner
        else [],
        "favorite_movie_ids": existing_owner.get("favorite_movie_ids", existing_owner.get("wishlist_movie_ids", []))
        if existing_owner
        else [],
        "cart_items": existing_owner.get("cart_items", []) if existing_owner else [],
        "rented_movies": existing_owner.get("rented_movies", []) if existing_owner else [],
        "created_at": existing_owner.get("created_at", now) if existing_owner else now,
    }

    if existing_owner:
        await db["users"].update_one({"_id": existing_owner["_id"]}, {"$set": owner_payload})
        return

    await db["users"].insert_one(owner_payload)

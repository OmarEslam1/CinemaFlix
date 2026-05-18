from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.db.mongodb import get_database

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def parse_object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid object id.",
        )
    return ObjectId(value)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        user_object_id = parse_object_id(user_id) if user_id else None
    except (ValueError, HTTPException) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
        ) from exc

    if not user_id or user_object_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
        )

    db = get_database()
    user = await db["users"].find_one({"_id": user_object_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    return user


async def get_current_owner(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_owner", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner account can manage movie data.",
        )
    return current_user

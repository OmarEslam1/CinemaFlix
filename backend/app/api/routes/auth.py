from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.api.deps import get_current_user
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
)
from app.db.mongodb import get_database, serialize_object_id
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse

router = APIRouter()


def build_user_response(user: dict) -> UserResponse:
    wishlist_ids = user.get("wishlist_movie_ids", user.get("favorite_movie_ids", []))
    return UserResponse(
        id=serialize_object_id(user["_id"]),
        username=user["username"],
        email=user["email"],
        is_owner=user.get("is_owner", False),
        wishlist_movie_ids=[serialize_object_id(movie_id) for movie_id in wishlist_ids],
        created_at=user["created_at"],
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest) -> TokenResponse:
    db = get_database()
    now = datetime.now(UTC)

    user_document = {
        "username": payload.username.strip(),
        "email": payload.email.lower(),
        "password": get_password_hash(payload.password),
        "is_owner": False,
        "wishlist_movie_ids": [],
        "favorite_movie_ids": [],
        "cart_items": [],
        "rented_movies": [],
        "created_at": now,
    }

    try:
        result = await db["users"].insert_one(user_document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists.",
        ) from exc

    user_document["_id"] = result.inserted_id
    token = create_access_token(str(result.inserted_id))

    return TokenResponse(
        access_token=token,
        user=build_user_response(user_document),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest) -> TokenResponse:
    db = get_database()
    identifier = payload.identifier.strip()

    user = await db["users"].find_one(
        {
            "$or": [
                {"username": identifier},
                {"email": identifier.lower()},
            ]
        }
    )
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
        )

    token = create_access_token(str(user["_id"]))
    return TokenResponse(
        access_token=token,
        user=build_user_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)) -> UserResponse:
    return build_user_response(current_user)

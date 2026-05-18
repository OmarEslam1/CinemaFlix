from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import ReturnDocument

from app.api.deps import get_current_owner, get_current_user, parse_object_id
from app.db.mongodb import get_database, serialize_object_id
from app.schemas.movie import HomeResponse, MovieCreate, MovieResponse, MovieUpdate

router = APIRouter()


def build_movie_response(movie: dict) -> MovieResponse:
    return MovieResponse(
        id=serialize_object_id(movie["_id"]),
        title=movie["title"],
        image=movie["image"],
        description=movie["description"],
        genre=movie["genre"],
        rental_price=movie.get("rental_price", 4.99),
        sections=movie.get("sections", []),
        is_featured=movie.get("is_featured", False),
        created_at=movie["created_at"],
        updated_at=movie["updated_at"],
    )


@router.get("/home", response_model=HomeResponse)
async def get_home(current_user: dict = Depends(get_current_user)) -> HomeResponse:
    db = get_database()

    featured_doc = await db["movies"].find_one({"is_featured": True})
    daily_docs = await db["movies"].find({"sections": "daily"}).to_list(length=20)
    trending_docs = await db["movies"].find({"sections": "trending"}).to_list(length=20)
    my_movie_docs = await db["movies"].find({"sections": "my_movies"}).to_list(length=20)

    return HomeResponse(
        featured=build_movie_response(featured_doc) if featured_doc else None,
        daily_movies=[build_movie_response(movie) for movie in daily_docs],
        trending_movies=[build_movie_response(movie) for movie in trending_docs],
        my_movies=[build_movie_response(movie) for movie in my_movie_docs],
        wishlist_movie_ids=[
            serialize_object_id(movie_id)
            for movie_id in current_user.get(
                "wishlist_movie_ids",
                current_user.get("favorite_movie_ids", []),
            )
        ],
    )


@router.get("/movies", response_model=list[MovieResponse])
async def list_movies(current_user: dict = Depends(get_current_user)) -> list[MovieResponse]:
    db = get_database()
    movies = await db["movies"].find().sort("created_at", -1).to_list(length=200)
    return [build_movie_response(movie) for movie in movies]


@router.get("/movies/{movie_id}", response_model=MovieResponse)
async def get_movie(movie_id: str, current_user: dict = Depends(get_current_user)) -> MovieResponse:
    db = get_database()
    movie = await db["movies"].find_one({"_id": parse_object_id(movie_id)})
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    return build_movie_response(movie)


@router.post("/movies", response_model=MovieResponse, status_code=status.HTTP_201_CREATED)
async def create_movie(
    payload: MovieCreate,
    current_user: dict = Depends(get_current_owner),
) -> MovieResponse:
    db = get_database()
    now = datetime.now(UTC)
    movie_document = {
        **payload.model_dump(),
        "created_at": now,
        "updated_at": now,
        "created_by": current_user["_id"],
    }
    result = await db["movies"].insert_one(movie_document)
    movie_document["_id"] = result.inserted_id
    return build_movie_response(movie_document)


@router.patch("/movies/{movie_id}", response_model=MovieResponse)
async def update_movie(
    movie_id: str,
    payload: MovieUpdate,
    current_user: dict = Depends(get_current_owner),
) -> MovieResponse:
    db = get_database()
    update_payload = payload.model_dump(exclude_none=True)
    if not update_payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update.",
        )

    update_payload["updated_at"] = datetime.now(UTC)
    updated_movie = await db["movies"].find_one_and_update(
        {"_id": parse_object_id(movie_id)},
        {"$set": update_payload},
        return_document=ReturnDocument.AFTER,
    )
    if not updated_movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")
    return build_movie_response(updated_movie)


@router.delete("/movies/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movie(
    movie_id: str,
    current_user: dict = Depends(get_current_owner),
) -> None:
    db = get_database()
    object_id = parse_object_id(movie_id)
    result = await db["movies"].delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    await db["users"].update_many(
        {},
        {
            "$pull": {
                "favorite_movie_ids": object_id,
                "wishlist_movie_ids": object_id,
                "cart_items": {"movie_id": object_id},
                "rented_movies": {"movie_id": object_id},
            }
        },
    )

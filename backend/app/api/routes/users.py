from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user, parse_object_id
from app.api.routes.movies import build_movie_response
from app.db.mongodb import get_database
from app.schemas.auth import CartItemRequest
from app.schemas.movie import MovieResponse
from app.schemas.user import CartItemResponse, RentalItemResponse

router = APIRouter()


async def build_movie_lookup(movie_ids: list) -> dict:
    db = get_database()
    if not movie_ids:
        return {}

    movies = await db["movies"].find({"_id": {"$in": movie_ids}}).to_list(length=500)
    return {movie["_id"]: movie for movie in movies}


def get_wishlist_ids(user: dict) -> list:
    return user.get("wishlist_movie_ids", user.get("favorite_movie_ids", []))


@router.get("/me/wishlist", response_model=list[MovieResponse])
async def get_my_wishlist(
    current_user: dict = Depends(get_current_user),
) -> list[MovieResponse]:
    db = get_database()
    wishlist_ids = get_wishlist_ids(current_user)
    if not wishlist_ids:
        return []

    movies = await db["movies"].find({"_id": {"$in": wishlist_ids}}).to_list(length=200)
    return [build_movie_response(movie) for movie in movies]


@router.post("/me/wishlist/{movie_id}", response_model=list[MovieResponse])
async def add_to_wishlist(
    movie_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[MovieResponse]:
    db = get_database()
    object_id = parse_object_id(movie_id)
    movie = await db["movies"].find_one({"_id": object_id})
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {
            "$addToSet": {
                "wishlist_movie_ids": object_id,
                "favorite_movie_ids": object_id,
            }
        },
    )
    refreshed_user = await db["users"].find_one({"_id": current_user["_id"]})
    wishlist_ids = get_wishlist_ids(refreshed_user)
    movies = await db["movies"].find({"_id": {"$in": wishlist_ids}}).to_list(length=200)
    return [build_movie_response(item) for item in movies]


@router.delete("/me/wishlist/{movie_id}", response_model=list[MovieResponse])
async def remove_from_wishlist(
    movie_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[MovieResponse]:
    db = get_database()
    object_id = parse_object_id(movie_id)

    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {
            "$pull": {
                "wishlist_movie_ids": object_id,
                "favorite_movie_ids": object_id,
            }
        },
    )
    refreshed_user = await db["users"].find_one({"_id": current_user["_id"]})
    wishlist_ids = get_wishlist_ids(refreshed_user)
    movies = await db["movies"].find({"_id": {"$in": wishlist_ids}}).to_list(length=200)
    return [build_movie_response(item) for item in movies]


@router.get("/me/favorites", response_model=list[MovieResponse])
async def get_my_favorites(
    current_user: dict = Depends(get_current_user),
) -> list[MovieResponse]:
    return await get_my_wishlist(current_user)


@router.post("/me/favorites/{movie_id}", response_model=list[MovieResponse])
async def add_favorite_movie(
    movie_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[MovieResponse]:
    return await add_to_wishlist(movie_id, current_user)


@router.delete("/me/favorites/{movie_id}", response_model=list[MovieResponse])
async def remove_favorite_movie(
    movie_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[MovieResponse]:
    return await remove_from_wishlist(movie_id, current_user)


@router.get("/me/cart", response_model=list[CartItemResponse])
async def get_my_cart(
    current_user: dict = Depends(get_current_user),
) -> list[CartItemResponse]:
    cart_items = current_user.get("cart_items", [])
    movie_lookup = await build_movie_lookup([item["movie_id"] for item in cart_items])

    response_items: list[CartItemResponse] = []
    for item in cart_items:
        movie = movie_lookup.get(item["movie_id"])
        if not movie:
            continue
        response_items.append(
            CartItemResponse(
                movie=build_movie_response(movie),
                days=item["days"],
                price=item["price"],
                added_at=item["added_at"],
            )
        )

    return response_items


@router.post("/me/cart/{movie_id}", response_model=list[CartItemResponse])
async def add_to_cart(
    movie_id: str,
    payload: CartItemRequest,
    current_user: dict = Depends(get_current_user),
) -> list[CartItemResponse]:
    db = get_database()
    object_id = parse_object_id(movie_id)
    movie = await db["movies"].find_one({"_id": object_id})
    if not movie:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found.")

    cart_items = current_user.get("cart_items", [])
    updated = False
    for item in cart_items:
        if item["movie_id"] == object_id:
            item["days"] = payload.days
            item["price"] = round(movie.get("rental_price", 4.99) * payload.days, 2)
            updated = True
            break

    if not updated:
        cart_items.append(
            {
                "movie_id": object_id,
                "days": payload.days,
                "price": round(movie.get("rental_price", 4.99) * payload.days, 2),
                "added_at": datetime.now(UTC),
            }
        )

    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"cart_items": cart_items}},
    )
    refreshed_user = await db["users"].find_one({"_id": current_user["_id"]})
    return await get_my_cart(refreshed_user)


@router.patch("/me/cart/{movie_id}", response_model=list[CartItemResponse])
async def update_cart_item(
    movie_id: str,
    payload: CartItemRequest,
    current_user: dict = Depends(get_current_user),
) -> list[CartItemResponse]:
    return await add_to_cart(movie_id, payload, current_user)


@router.delete("/me/cart/{movie_id}", response_model=list[CartItemResponse])
async def remove_from_cart(
    movie_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[CartItemResponse]:
    db = get_database()
    object_id = parse_object_id(movie_id)
    cart_items = [
        item for item in current_user.get("cart_items", []) if item["movie_id"] != object_id
    ]
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"cart_items": cart_items}},
    )
    refreshed_user = await db["users"].find_one({"_id": current_user["_id"]})
    return await get_my_cart(refreshed_user)


@router.post("/me/cart-checkout", response_model=list[RentalItemResponse])
async def checkout_cart(
    current_user: dict = Depends(get_current_user),
) -> list[RentalItemResponse]:
    db = get_database()
    cart_items = current_user.get("cart_items", [])
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your shopping cart is empty.",
        )

    now = datetime.now(UTC)
    rented_movies = current_user.get("rented_movies", [])
    for item in cart_items:
        rented_movies.append(
            {
                "movie_id": item["movie_id"],
                "days": item["days"],
                "price": item["price"],
                "rented_at": now,
                "expires_at": now + timedelta(days=item["days"]),
            }
        )

    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"cart_items": [], "rented_movies": rented_movies}},
    )
    refreshed_user = await db["users"].find_one({"_id": current_user["_id"]})
    return await get_my_rentals(refreshed_user)


@router.get("/me/rentals", response_model=list[RentalItemResponse])
async def get_my_rentals(
    current_user: dict = Depends(get_current_user),
) -> list[RentalItemResponse]:
    rentals = current_user.get("rented_movies", [])
    movie_lookup = await build_movie_lookup([item["movie_id"] for item in rentals])

    response_items: list[RentalItemResponse] = []
    for item in rentals:
        movie = movie_lookup.get(item["movie_id"])
        if not movie:
            continue
        response_items.append(
            RentalItemResponse(
                movie=build_movie_response(movie),
                days=item["days"],
                price=item["price"],
                rented_at=item["rented_at"],
                expires_at=item["expires_at"],
            )
        )

    return response_items

from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.movie import MovieResponse


class CartItemResponse(BaseModel):
    movie: MovieResponse
    days: int
    price: float
    added_at: datetime


class RentalItemResponse(BaseModel):
    movie: MovieResponse
    days: int
    price: float
    rented_at: datetime
    expires_at: datetime


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    is_owner: bool
    wishlist_movie_ids: list[str]
    created_at: datetime

from datetime import datetime

from pydantic import BaseModel, Field


class MovieBase(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    image: str = Field(min_length=1, max_length=500)
    description: str = Field(min_length=1, max_length=2000)
    genre: str = Field(min_length=1, max_length=100)
    rental_price: float = Field(default=4.99, ge=0)
    sections: list[str] = Field(default_factory=list)
    is_featured: bool = False


class MovieCreate(MovieBase):
    pass


class MovieUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    image: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = Field(default=None, min_length=1, max_length=2000)
    genre: str | None = Field(default=None, min_length=1, max_length=100)
    rental_price: float | None = Field(default=None, ge=0)
    sections: list[str] | None = None
    is_featured: bool | None = None


class MovieResponse(MovieBase):
    id: str
    created_at: datetime
    updated_at: datetime


class HomeResponse(BaseModel):
    featured: MovieResponse | None
    daily_movies: list[MovieResponse]
    trending_movies: list[MovieResponse]
    my_movies: list[MovieResponse]
    wishlist_movie_ids: list[str]

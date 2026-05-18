from fastapi import APIRouter

from app.api.routes import auth, movies, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(movies.router, tags=["movies"])
api_router.include_router(users.router, prefix="/users", tags=["users"])


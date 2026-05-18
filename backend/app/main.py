from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.bootstrap import ensure_owner_account
from app.db.mongodb import close_mongo_connection, connect_to_mongo, ensure_indexes


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    await ensure_indexes()
    await ensure_owner_account()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.api_prefix)

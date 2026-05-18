# CinemaFlix Backend

FastAPI backend for the CinemaFlix movie website.

## Features

- User registration and login with JWT authentication
- MongoDB integration with Motor
- Home endpoint for featured, daily, and trending movies
- Movie CRUD endpoints
- Favourite movie add/remove endpoints
- Seed script for the movie records shown in the provided UI

## Project Structure

```text
backend/
  app/
    api/
    core/
    db/
    schemas/
    services/
    main.py
  scripts/
  pyproject.toml
```

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your MongoDB URI, database name, and JWT secret.
3. Run the app:

```powershell
cd "D:\Software Enginnering\backend"
$env:UV_CACHE_DIR = "$PWD\.uv-cache"
uv sync
uv run uvicorn app.main:app --reload
```

## Seed the Initial Movies

```powershell
cd "D:\Software Enginnering\backend"
$env:UV_CACHE_DIR = "$PWD\.uv-cache"
uv run python scripts/seed_movies.py
```

## Main API Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/home`
- `GET /api/v1/movies`
- `POST /api/v1/movies`
- `GET /api/v1/movies/{movie_id}`
- `PATCH /api/v1/movies/{movie_id}`
- `DELETE /api/v1/movies/{movie_id}`
- `GET /api/v1/users/me/favorites`
- `POST /api/v1/users/me/favorites/{movie_id}`
- `DELETE /api/v1/users/me/favorites/{movie_id}`

## Notes for the React Frontend

- Use the JWT access token in the `Authorization` header as `Bearer <token>`.
- The API stores image paths as workspace-relative frontend-friendly paths like `/images/Card 1.png`.
- Login accepts either `username` or `email` in the `identifier` field.
- CORS is configured for local frontend ports `3000`, `5173`, and `4173`.

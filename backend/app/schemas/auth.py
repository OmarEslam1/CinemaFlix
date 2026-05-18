from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class CartItemRequest(BaseModel):
    days: int = Field(default=3, ge=1, le=30)


class LoginRequest(BaseModel):
    identifier: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


from app.schemas.user import UserResponse  # noqa: E402

TokenResponse.model_rebuild()

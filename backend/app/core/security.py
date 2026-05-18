import base64
import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt

from app.core.config import settings

PBKDF2_ITERATIONS = 100_000
PBKDF2_ALGORITHM = "sha256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        scheme, iterations, salt, stored_hash = hashed_password.split("$", 3)
    except ValueError:
        return False

    if scheme != f"pbkdf2_{PBKDF2_ALGORITHM}":
        return False

    computed_hash = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM,
        plain_password.encode("utf-8"),
        base64.b64decode(salt.encode("utf-8")),
        int(iterations),
    )
    encoded_hash = base64.b64encode(computed_hash).decode("utf-8")
    return hmac.compare_digest(encoded_hash, stored_hash)


def get_password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    password_hash = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM,
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    encoded_salt = base64.b64encode(salt).decode("utf-8")
    encoded_hash = base64.b64encode(password_hash).decode("utf-8")
    return f"pbkdf2_{PBKDF2_ALGORITHM}${PBKDF2_ITERATIONS}${encoded_salt}${encoded_hash}"


def create_access_token(subject: str) -> str:
    expire = datetime.now(UTC) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": subject,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise ValueError("Invalid token.") from exc

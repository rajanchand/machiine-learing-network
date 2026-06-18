"""JWT authentication handler — token creation, verification, and password hashing."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt
from pydantic import BaseModel


class TokenPayload(BaseModel):
    """JWT token payload schema."""

    sub: str  # user_id
    username: str
    role: str
    exp: datetime
    iat: datetime
    token_type: str = "access"


class TokenPair(BaseModel):
    """Access + Refresh token pair."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(
    user_id: str,
    username: str,
    role: str,
    secret_key: str,
    algorithm: str = "HS256",
    expiry_minutes: int = 60,
) -> str:
    """Create a JWT access token."""
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": now + timedelta(minutes=expiry_minutes),
        "iat": now,
        "token_type": "access",
    }
    return jwt.encode(payload, secret_key, algorithm=algorithm)


def create_refresh_token(
    user_id: str,
    username: str,
    role: str,
    secret_key: str,
    algorithm: str = "HS256",
    expiry_days: int = 7,
) -> str:
    """Create a JWT refresh token."""
    now = datetime.now(UTC)
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": now + timedelta(days=expiry_days),
        "iat": now,
        "token_type": "refresh",
    }
    return jwt.encode(payload, secret_key, algorithm=algorithm)


def create_token_pair(
    user_id: str,
    username: str,
    role: str,
    secret_key: str,
    algorithm: str = "HS256",
    expiry_minutes: int = 60,
    refresh_expiry_days: int = 7,
) -> TokenPair:
    """Create both access and refresh tokens."""
    access_token = create_access_token(
        user_id, username, role, secret_key, algorithm, expiry_minutes
    )
    refresh_token = create_refresh_token(
        user_id, username, role, secret_key, algorithm, refresh_expiry_days
    )
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expiry_minutes * 60,
    )


def decode_token(
    token: str,
    secret_key: str,
    algorithm: str = "HS256",
) -> dict[str, Any]:
    """Decode and verify a JWT token. Raises jwt.exceptions on failure."""
    return jwt.decode(token, secret_key, algorithms=[algorithm])


def get_user_from_token(
    token: str,
    secret_key: str,
    algorithm: str = "HS256",
) -> dict[str, Any] | None:
    """Safely decode a token and return user info, or None if invalid."""
    try:
        payload = decode_token(token, secret_key, algorithm)
        return {
            "user_id": payload.get("sub"),
            "username": payload.get("username"),
            "role": payload.get("role"),
            "token_type": payload.get("token_type"),
        }
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

"""Authentication router — session-based login and logout."""

from __future__ import annotations

import time
from collections import defaultdict
from typing import cast

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from anomaly_detection.db.models import User
from anomaly_detection.logging import get_logger
from anomaly_detection.utils.auth import verify_password

logger = get_logger(__name__)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Simple in-memory rate limiter: {ip -> [(timestamp, count)]}
# For multi-worker deployments, replace with Redis.
_login_attempts: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(ip: str, limit: int) -> None:
    """Raise 429 if ip has exceeded `limit` login attempts in the last 60 seconds."""
    now = time.monotonic()
    window_start = now - 60
    attempts = [t for t in _login_attempts[ip] if t > window_start]
    _login_attempts[ip] = attempts

    if len(attempts) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Try again in a minute.",
        )

    _login_attempts[ip].append(now)


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    username: str
    status: str


def _get_session(request: Request) -> AsyncSession:
    return cast("AsyncSession", request.app.state.session_factory())


@router.post("/login", response_model=AuthResponse)
async def login(request: Request, payload: LoginRequest) -> AuthResponse:
    client_ip = request.client.host if request.client else "unknown"
    settings = request.app.state.settings
    _check_rate_limit(client_ip, settings.login_rate_limit)

    async with _get_session(request) as session:
        result = await session.execute(select(User).where(User.username == payload.username))
        user = result.scalar_one_or_none()

    # Always call verify_password to avoid timing differences that reveal valid usernames.
    password_hash = user.password_hash if user else "x" * 60
    is_valid = user is not None and verify_password(payload.password, password_hash)

    if not is_valid:
        logger.warning("login_failed", username=payload.username, ip=client_ip)
        raise HTTPException(status_code=401, detail="Invalid username or password")

    request.session["user"] = user.username  # type: ignore[union-attr]
    request.session["user_id"] = str(user.id)  # type: ignore[union-attr]
    logger.info("login_success", username=user.username, ip=client_ip)  # type: ignore[union-attr]

    return AuthResponse(username=user.username, status="authenticated")  # type: ignore[union-attr]


@router.post("/logout")
async def logout(request: Request) -> dict[str, str]:
    username = request.session.get("user", "unknown")
    request.session.clear()
    logger.info("logout", username=username)
    return {"status": "logged_out"}


@router.get("/me", response_model=AuthResponse)
async def me(request: Request) -> AuthResponse:
    username = request.session.get("user")
    if not username:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return AuthResponse(username=username, status="authenticated")

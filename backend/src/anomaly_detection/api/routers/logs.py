"""Logs router — login, packet, attack, prediction, system, and audit logs."""

from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select

from anomaly_detection.db.models import (
    AuditLog,
    LoginLog,
    SystemLog,
    Attack,
    Prediction,
    Packet,
)
from anomaly_detection.schemas.common import (
    AuditLogResponse,
    LoginLogResponse,
    SystemLogResponse,
)

router = APIRouter(prefix="/api/v1/logs", tags=["logs"])


@router.get("/login")
async def login_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    search: str | None = None,
) -> dict:
    """Get login audit logs."""
    session_factory = request.app.state.session_factory

    async with session_factory() as session:
        query = select(LoginLog)
        count_query = select(func.count(LoginLog.id))

        if search:
            sf = LoginLog.username.ilike(f"%{search}%") | LoginLog.ip_address.ilike(f"%{search}%")
            query = query.where(sf)
            count_query = count_query.where(sf)

        total = (await session.execute(count_query)).scalar() or 0
        offset = (page - 1) * per_page
        result = await session.execute(
            query.order_by(LoginLog.created_at.desc()).offset(offset).limit(per_page)
        )
        logs = result.scalars().all()

        return {
            "items": [
                LoginLogResponse(
                    id=l.id, username=l.username, ip_address=l.ip_address,
                    success=l.success, failure_reason=l.failure_reason,
                    created_at=l.created_at,
                ).model_dump()
                for l in logs
            ],
            "total": total, "page": page, "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }


@router.get("/packets")
async def packet_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
) -> dict:
    """Get packet capture logs."""
    session_factory = request.app.state.session_factory

    async with session_factory() as session:
        total = (await session.execute(select(func.count(Packet.id)))).scalar() or 0
        offset = (page - 1) * per_page
        result = await session.execute(
            select(Packet).order_by(Packet.timestamp.desc()).offset(offset).limit(per_page)
        )
        packets = result.scalars().all()

        return {
            "items": [
                {
                    "id": str(p.id), "timestamp": p.timestamp.isoformat(),
                    "src_ip": p.src_ip, "dst_ip": p.dst_ip,
                    "protocol": p.protocol, "packet_size": p.packet_size,
                    "status": p.status,
                }
                for p in packets
            ],
            "total": total, "page": page, "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }


@router.get("/attacks")
async def attack_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
) -> dict:
    """Get attack detection logs."""
    session_factory = request.app.state.session_factory

    async with session_factory() as session:
        total = (await session.execute(select(func.count(Attack.id)))).scalar() or 0
        offset = (page - 1) * per_page
        result = await session.execute(
            select(Attack).order_by(Attack.detected_at.desc()).offset(offset).limit(per_page)
        )
        attacks = result.scalars().all()

        return {
            "items": [
                {
                    "id": str(a.id), "attack_type": a.attack_type,
                    "severity": a.severity.value, "src_ip": a.src_ip,
                    "dst_ip": a.dst_ip, "confidence": a.confidence,
                    "detected_at": a.detected_at.isoformat(),
                }
                for a in attacks
            ],
            "total": total, "page": page, "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }


@router.get("/predictions")
async def prediction_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
) -> dict:
    """Get ML prediction logs."""
    session_factory = request.app.state.session_factory

    async with session_factory() as session:
        total = (await session.execute(select(func.count(Prediction.id)))).scalar() or 0
        offset = (page - 1) * per_page
        result = await session.execute(
            select(Prediction).order_by(Prediction.created_at.desc()).offset(offset).limit(per_page)
        )
        preds = result.scalars().all()

        return {
            "items": [
                {
                    "id": str(p.id), "model_name": p.model_name,
                    "is_anomaly": p.is_anomaly, "confidence": p.confidence,
                    "prediction_label": p.prediction_label,
                    "created_at": p.created_at.isoformat(),
                }
                for p in preds
            ],
            "total": total, "page": page, "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }


@router.get("/system")
async def system_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
    level: str | None = None,
) -> dict:
    """Get system event logs."""
    session_factory = request.app.state.session_factory

    async with session_factory() as session:
        query = select(SystemLog)
        count_query = select(func.count(SystemLog.id))

        if level:
            query = query.where(SystemLog.level == level)
            count_query = count_query.where(SystemLog.level == level)

        total = (await session.execute(count_query)).scalar() or 0
        offset = (page - 1) * per_page
        result = await session.execute(
            query.order_by(SystemLog.created_at.desc()).offset(offset).limit(per_page)
        )
        logs = result.scalars().all()

        return {
            "items": [
                SystemLogResponse(
                    id=l.id, level=l.level, source=l.source,
                    message=l.message, created_at=l.created_at,
                ).model_dump()
                for l in logs
            ],
            "total": total, "page": page, "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }


@router.get("/audit")
async def audit_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=100),
) -> dict:
    """Get user action audit logs."""
    session_factory = request.app.state.session_factory

    async with session_factory() as session:
        total = (await session.execute(select(func.count(AuditLog.id)))).scalar() or 0
        offset = (page - 1) * per_page
        result = await session.execute(
            select(AuditLog).order_by(AuditLog.created_at.desc()).offset(offset).limit(per_page)
        )
        logs = result.scalars().all()

        return {
            "items": [
                AuditLogResponse(
                    id=l.id, action=l.action, resource=l.resource,
                    resource_id=l.resource_id, details=l.details,
                    ip_address=l.ip_address, created_at=l.created_at,
                ).model_dump()
                for l in logs
            ],
            "total": total, "page": page, "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }


@router.get("/export")
async def export_logs(request: Request, log_type: str = "system") -> StreamingResponse:
    """Export logs as CSV."""
    session_factory = request.app.state.session_factory
    output = io.StringIO()
    writer = csv.writer(output)

    async with session_factory() as session:
        if log_type == "login":
            writer.writerow(["Username", "IP Address", "Success", "Reason", "Timestamp"])
            result = await session.execute(select(LoginLog).order_by(LoginLog.created_at.desc()).limit(5000))
            for l in result.scalars().all():
                writer.writerow([l.username, l.ip_address, l.success, l.failure_reason, l.created_at.isoformat()])
        elif log_type == "system":
            writer.writerow(["Level", "Source", "Message", "Timestamp"])
            result = await session.execute(select(SystemLog).order_by(SystemLog.created_at.desc()).limit(5000))
            for l in result.scalars().all():
                writer.writerow([l.level, l.source, l.message, l.created_at.isoformat()])
        elif log_type == "audit":
            writer.writerow(["Action", "Resource", "Resource ID", "Details", "IP", "Timestamp"])
            result = await session.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(5000))
            for l in result.scalars().all():
                writer.writerow([l.action, l.resource, l.resource_id, l.details, l.ip_address, l.created_at.isoformat()])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={log_type}_logs.csv"},
    )

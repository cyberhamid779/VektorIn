from fastapi import Request
from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog


def _client_ip(request: Request | None) -> str | None:
    if request is None:
        return None
    # proxy-dən gələn real IP-ni götür
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def log_activity(
    db: Session,
    action: str,
    user_id: int | None = None,
    email: str | None = None,
    request: Request | None = None,
    details: str | None = None,
) -> None:
    entry = ActivityLog(
        user_id=user_id,
        email=email,
        action=action,
        ip_address=_client_ip(request),
        user_agent=(request.headers.get("user-agent") if request else None),
        details=details,
    )
    db.add(entry)
    db.commit()

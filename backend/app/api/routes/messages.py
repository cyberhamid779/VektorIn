from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, text
from pydantic import BaseModel
from jose import jwt, JWTError

from app.services.database import get_db, SessionLocal
from app.services.auth import get_current_user
from app.services.ws_manager import manager
from app.services.encryption import encrypt_msg, decrypt_msg
from app.models.user import User
from app.models.message import Message
from app.models.connection import Connection
from app.config import settings

router = APIRouter(prefix="/api/messages", tags=["messages"])


class SendMessage(BaseModel):
    content: str


# ── REST endpoints ────────────────────────────────────────────────────

@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).count()
    return {"count": count}


@router.get("")
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.execute(text("""
        SELECT
            lm.partner_id,
            lm.last_content,
            lm.last_created_at,
            COALESCE(u.full_name, ''),
            u.profile_picture,
            u.last_seen,
            COALESCE(unread.cnt, 0) AS unread_count
        FROM (
            SELECT DISTINCT ON (partner_id)
                CASE WHEN sender_id = :me THEN receiver_id ELSE sender_id END AS partner_id,
                content AS last_content,
                created_at AS last_created_at
            FROM messages
            WHERE sender_id = :me OR receiver_id = :me
            ORDER BY partner_id, created_at DESC
        ) lm
        JOIN users u ON u.id = lm.partner_id
        LEFT JOIN (
            SELECT sender_id AS partner_id, COUNT(*) AS cnt
            FROM messages
            WHERE receiver_id = :me AND is_read = FALSE
            GROUP BY sender_id
        ) unread ON unread.partner_id = lm.partner_id
        ORDER BY lm.last_created_at DESC
    """), {"me": current_user.id}).fetchall()

    return [
        {
            "user_id": r[0],
            "last_message": decrypt_msg(r[1]),
            "last_created_at": str(r[2]),
            "full_name": r[3],
            "profile_picture": r[4],
            "last_seen": str(r[5]) if r[5] else None,
            "unread_count": r[6],
            "is_online": manager.is_online(r[0]),
        }
        for r in rows
    ]


@router.get("/{user_id}")
def get_messages(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msgs = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
                and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    db.query(Message).filter(
        Message.sender_id == user_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "content": decrypt_msg(m.content),
            "is_mine": m.sender_id == current_user.id,
            "is_read": m.is_read,
            "created_at": str(m.created_at),
        }
        for m in msgs
    ]


@router.post("/{user_id}")
async def send_message(
    user_id: int,
    data: SendMessage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = data.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Mesaj boş ola bilməz")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Özünüzə mesaj göndərə bilməzsiniz")

    receiver = db.query(User).filter(User.id == user_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")

    connected = db.query(Connection).filter(
        or_(
            and_(Connection.sender_id == current_user.id, Connection.receiver_id == user_id),
            and_(Connection.sender_id == user_id, Connection.receiver_id == current_user.id),
        ),
        Connection.status == "accepted",
    ).first()
    if not connected:
        raise HTTPException(status_code=403, detail="Yalnız bağlantılarınıza mesaj göndərə bilərsiniz")

    msg = Message(sender_id=current_user.id, receiver_id=user_id, content=encrypt_msg(content))
    db.add(msg)
    db.commit()
    db.refresh(msg)

    from app.services.notifier import create_notification
    create_notification(db, user_id=user_id, from_user_id=current_user.id, type="message")

    push_base = {
        "type": "message",
        "id": msg.id,
        "sender_id": current_user.id,
        "receiver_id": user_id,
        "sender_name": current_user.full_name,
        "sender_picture": current_user.profile_picture,
        "content": content,
        "created_at": str(msg.created_at),
    }
    await manager.send(user_id, {**push_base, "is_mine": False})
    await manager.send(current_user.id, {**push_base, "is_mine": True})

    return {"id": msg.id, "content": content, "created_at": str(msg.created_at), "is_mine": True}


# ── WebSocket ─────────────────────────────────────────────────────────

@router.websocket("/ws")
async def ws_messages(websocket: WebSocket, token: str = Query(...)):
    db = SessionLocal()
    user_id = None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub", 0))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            await websocket.close(code=1008)
            db.close()
            return
    except (JWTError, Exception):
        await websocket.close(code=1008)
        db.close()
        return

    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            t = data.get("type")

            if t == "read":
                other_id = data.get("other_user_id")
                if other_id:
                    db.query(Message).filter(
                        Message.sender_id == other_id,
                        Message.receiver_id == user_id,
                        Message.is_read == False,
                    ).update({"is_read": True})
                    db.commit()
                    await manager.send(other_id, {"type": "read", "other_user_id": user_id})

            elif t == "ping":
                await manager.send(user_id, {"type": "pong"})

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id)
        db.close()

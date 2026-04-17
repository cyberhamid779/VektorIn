from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from pydantic import BaseModel
from app.services.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.message import Message
from app.models.connection import Connection

router = APIRouter(prefix="/api/messages", tags=["messages"])


class SendMessage(BaseModel):
    content: str


@router.post("/{user_id}")
def send_message(user_id: int, data: SendMessage, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # yalniz baglanti olanlara mesaj
    conn = db.query(Connection).filter(
        or_(
            and_(Connection.sender_id == current_user.id, Connection.receiver_id == user_id),
            and_(Connection.sender_id == user_id, Connection.receiver_id == current_user.id),
        ),
        Connection.status == "accepted",
    ).first()

    if not conn:
        raise HTTPException(status_code=403, detail="Yalnız bağlantılarınıza mesaj göndərə bilərsiniz")

    msg = Message(sender_id=current_user.id, receiver_id=user_id, content=data.content)
    db.add(msg)
    db.commit()
    return {"message": "Mesaj göndərildi"}


@router.get("/{user_id}")
def get_conversation(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
        )
    ).order_by(Message.created_at.asc()).all()

    # oxunmamislari oxunmus et
    db.query(Message).filter(
        Message.sender_id == user_id, Message.receiver_id == current_user.id, Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    return [
        {
            "id": m.id,
            "sender_id": m.sender_id,
            "content": m.content,
            "is_read": m.is_read,
            "created_at": str(m.created_at),
            "is_mine": m.sender_id == current_user.id,
        }
        for m in messages
    ]


@router.get("")
def get_chats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # son mesajlasilan istifadeciler
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).all()

    seen = set()
    chats = []
    for m in messages:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_id in seen:
            continue
        seen.add(other_id)
        other = db.query(User).filter(User.id == other_id).first()
        unread = db.query(Message).filter(
            Message.sender_id == other_id, Message.receiver_id == current_user.id, Message.is_read == False
        ).count()
        chats.append({
            "user_id": other_id,
            "full_name": other.full_name if other else "Naməlum",
            "profile_picture": other.profile_picture if other else None,
            "last_message": m.content,
            "unread_count": unread,
            "last_at": str(m.created_at),
            "last_seen": str(other.last_seen) if other and other.last_seen else None,
        })
    return chats

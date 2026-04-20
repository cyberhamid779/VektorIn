from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.services.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.message import Message

router = APIRouter(prefix="/api/messages", tags=["messages"])

QUICK_MESSAGES = [
    "Salam, tanış olaq!",
    "Layihəndə iştirak etmək istəyirəm",
    "Komandana qoşulmaq istərdim",
    "Birlikdə layihə edək?",
    "Profilin çox maraqlıdır",
    "Hackathon-da komandamıza qoşul",
    "Bu fəndən qeydlərin varmı?",
    "Təbriklər, əla iş!",
    "Sənin ixtisasın haqqında sualım var",
    "Kömək edə bilərəm, yaz mənə",
]


@router.get("/templates")
def get_templates():
    return QUICK_MESSAGES


class SendQuickMessage(BaseModel):
    template_index: int


@router.post("/{user_id}")
def send_quick_message(user_id: int, data: SendQuickMessage, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Özünə mesaj göndərə bilməzsən")

    if data.template_index < 0 or data.template_index >= len(QUICK_MESSAGES):
        raise HTTPException(status_code=400, detail="Yanlış mesaj seçimi")

    receiver = db.query(User).filter(User.id == user_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")

    content = QUICK_MESSAGES[data.template_index]
    msg = Message(sender_id=current_user.id, receiver_id=user_id, content=content)
    db.add(msg)
    db.commit()
    return {"message": "Mesaj göndərildi"}


@router.get("/inbox")
def get_inbox(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = db.query(Message).filter(
        Message.receiver_id == current_user.id
    ).order_by(Message.created_at.desc()).limit(50).all()

    # mark as read
    db.query(Message).filter(
        Message.receiver_id == current_user.id, Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    return [
        {
            "id": m.id,
            "sender_name": m.sender.full_name,
            "sender_id": m.sender_id,
            "sender_picture": m.sender.profile_picture,
            "content": m.content,
            "created_at": str(m.created_at),
        }
        for m in messages
    ]


@router.get("/unread-count")
def get_unread_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id, Message.is_read == False
    ).count()
    return {"count": count}

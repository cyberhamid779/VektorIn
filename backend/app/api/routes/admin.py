from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.services.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.post import Post, PostLike, Comment
from app.models.connection import Connection
from app.models.message import Message
from app.models.activity_log import ActivityLog

router = APIRouter(prefix="/api/admin", tags=["admin"])


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalnız admin icazəlidir")
    return current_user


# ─── Schemas ───

class StatsResponse(BaseModel):
    total_users: int
    active_users: int
    total_posts: int
    total_connections: int
    accepted_connections: int
    total_messages: int


class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    major: str | None
    course: int | None
    is_active: bool
    is_admin: bool
    is_open_for_team: bool
    created_at: str | None

    class Config:
        from_attributes = True


class AdminPostResponse(BaseModel):
    id: int
    content: str
    image_url: str | None
    is_pinned: bool
    created_at: str | None
    author_name: str
    author_id: int
    like_count: int
    comment_count: int


# ─── Stats ───

@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    return StatsResponse(
        total_users=db.query(func.count(User.id)).scalar(),
        active_users=db.query(func.count(User.id)).filter(User.is_active == True).scalar(),
        total_posts=db.query(func.count(Post.id)).scalar(),
        total_connections=db.query(func.count(Connection.id)).scalar(),
        accepted_connections=db.query(func.count(Connection.id)).filter(Connection.status == "accepted").scalar(),
        total_messages=db.query(func.count(Message.id)).scalar(),
    )


# ─── Users ───

@router.get("/users", response_model=list[AdminUserResponse])
def get_all_users(q: str = "", db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    query = db.query(User).order_by(User.created_at.desc())
    if q:
        query = query.filter(User.full_name.ilike(f"%{q}%"))
    users = query.all()
    return [
        AdminUserResponse(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            major=u.major,
            course=u.course,
            is_active=u.is_active,
            is_admin=u.is_admin,
            is_open_for_team=u.is_open_for_team,
            created_at=str(u.created_at) if u.created_at else None,
        )
        for u in users
    ]


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Özünüzü blok edə bilməzsiniz")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")

    user.is_active = not user.is_active
    db.commit()
    return {"message": f"{'Aktiv edildi' if user.is_active else 'Blok edildi'}", "is_active": user.is_active}


@router.patch("/users/{user_id}/toggle-admin")
def toggle_user_admin(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Öz admin statusunuzu dəyişə bilməzsiniz")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")

    user.is_admin = not user.is_admin
    db.commit()
    return {"message": f"{'Admin edildi' if user.is_admin else 'Admin çıxarıldı'}", "is_admin": user.is_admin}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Özünüzü silə bilməzsiniz")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")

    # Əlaqəli datanı sil
    db.query(PostLike).filter(PostLike.user_id == user_id).delete()
    db.query(Comment).filter(Comment.user_id == user_id).delete()
    posts = db.query(Post).filter(Post.author_id == user_id).all()
    for post in posts:
        db.query(PostLike).filter(PostLike.post_id == post.id).delete()
        db.query(Comment).filter(Comment.post_id == post.id).delete()
    db.query(Post).filter(Post.author_id == user_id).delete()
    db.query(Connection).filter((Connection.sender_id == user_id) | (Connection.receiver_id == user_id)).delete()
    db.query(Message).filter((Message.sender_id == user_id) | (Message.receiver_id == user_id)).delete()

    db.delete(user)
    db.commit()
    return {"message": "İstifadəçi silindi"}


# ─── Posts ───

@router.get("/posts", response_model=list[AdminPostResponse])
def get_all_posts(q: str = "", db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    query = db.query(Post).order_by(Post.created_at.desc())
    if q:
        query = query.filter(Post.content.ilike(f"%{q}%"))
    posts = query.all()
    return [
        AdminPostResponse(
            id=p.id,
            content=p.content,
            image_url=p.image_url,
            is_pinned=p.is_pinned,
            created_at=str(p.created_at) if p.created_at else None,
            author_name=p.author.full_name,
            author_id=p.author_id,
            like_count=len(p.likes),
            comment_count=len(p.comments),
        )
        for p in posts
    ]


@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post tapılmadı")

    db.delete(post)
    db.commit()
    return {"message": "Post silindi"}


@router.patch("/posts/{post_id}/pin")
def toggle_pin(post_id: int, db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post tapılmadı")

    post.is_pinned = not post.is_pinned
    db.commit()
    return {"message": "Pin statusu dəyişdirildi", "is_pinned": post.is_pinned}


# ─── Activity Logs ───

# Yalnız hesaba giriş/çıxış və qeydiyyatı göstər — mesaj və şəkil logları məxfidir
ALLOWED_LOG_ACTIONS = {"login_success", "login_failed", "register"}


class ActivityLogResponse(BaseModel):
    id: int
    user_id: int | None
    email: str | None
    full_name: str | None
    action: str
    ip_address: str | None
    user_agent: str | None
    details: str | None
    created_at: str | None


@router.get("/logs", response_model=list[ActivityLogResponse])
def get_activity_logs(
    action: str | None = None,
    user_id: int | None = None,
    email: str | None = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    query = db.query(ActivityLog).order_by(ActivityLog.created_at.desc())

    if action and action in ALLOWED_LOG_ACTIONS:
        query = query.filter(ActivityLog.action == action)
    else:
        query = query.filter(ActivityLog.action.in_(ALLOWED_LOG_ACTIONS))

    if user_id is not None:
        query = query.filter(ActivityLog.user_id == user_id)
    if email:
        query = query.filter(ActivityLog.email.ilike(f"%{email}%"))

    limit = max(1, min(limit, 500))
    logs = query.offset(offset).limit(limit).all()

    return [
        ActivityLogResponse(
            id=log.id,
            user_id=log.user_id,
            email=log.email,
            full_name=log.user.full_name if log.user else None,
            action=log.action,
            ip_address=log.ip_address,
            user_agent=log.user_agent,
            details=log.details,
            created_at=str(log.created_at) if log.created_at else None,
        )
        for log in logs
    ]


@router.delete("/logs/purge-sensitive")
def purge_sensitive_logs(db: Session = Depends(get_db), admin: User = Depends(get_admin_user)):
    """Mesaj və profil şəkli ilə bağlı köhnə log qeydlərini silir."""
    deleted = db.query(ActivityLog).filter(
        ~ActivityLog.action.in_(ALLOWED_LOG_ACTIONS)
    ).delete(synchronize_session=False)
    db.commit()
    return {"deleted": deleted}

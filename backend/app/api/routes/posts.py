from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.services.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.post import Post, PostLike, Comment, PostReport

router = APIRouter(prefix="/api/posts", tags=["posts"])


class PostCreate(BaseModel):
    content: str | None = None
    image_url: str | None = None
    video_url: str | None = None


class CommentCreate(BaseModel):
    content: str


class ReportCreate(BaseModel):
    reason: str | None = None


class PostResponse(BaseModel):
    id: int
    content: str | None
    image_url: str | None
    video_url: str | None
    is_pinned: bool
    created_at: str | None
    author_name: str
    author_id: int
    like_count: int
    comment_count: int
    is_liked: bool

    class Config:
        from_attributes = True


@router.get("", response_model=list[PostResponse])
def get_feed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    posts = db.query(Post).order_by(Post.is_pinned.desc(), Post.created_at.desc()).limit(50).all()

    result = []
    for post in posts:
        is_liked = db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == current_user.id).first() is not None
        result.append(PostResponse(
            id=post.id,
            content=post.content,
            image_url=post.image_url,
            video_url=post.video_url,
            is_pinned=post.is_pinned,
            created_at=str(post.created_at) if post.created_at else None,
            author_name=post.author.full_name,
            author_id=post.author_id,
            like_count=len(post.likes),
            comment_count=len(post.comments),
            is_liked=is_liked,
        ))
    return result


@router.post("", response_model=dict)
def create_post(data: PostCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    content = data.content.strip() if data.content else None
    if not content and not data.image_url and not data.video_url:
        raise HTTPException(status_code=400, detail="Post boş ola bilməz")
    post = Post(author_id=current_user.id, content=content, image_url=data.image_url, video_url=data.video_url)
    db.add(post)
    db.commit()
    return {"message": "Post yaradıldı", "id": post.id}


@router.post("/{post_id}/like")
def toggle_like(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post tapılmadı")

    existing = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Like silindi"}

    like = PostLike(post_id=post_id, user_id=current_user.id)
    db.add(like)
    db.commit()
    return {"message": "Like edildi"}


@router.post("/{post_id}/comment")
def add_comment(post_id: int, data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post tapılmadı")

    comment = Comment(post_id=post_id, user_id=current_user.id, content=data.content)
    db.add(comment)
    db.commit()
    return {"message": "Şərh əlavə edildi"}


@router.get("/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    return [
        {
            "id": c.id,
            "content": c.content,
            "user_name": c.user.full_name,
            "user_id": c.user_id,
            "created_at": str(c.created_at),
        }
        for c in comments
    ]


@router.post("/{post_id}/report")
def report_post(post_id: int, data: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post tapılmadı")
    if post.author_id == current_user.id:
        raise HTTPException(status_code=400, detail="Öz postunu şikayət edə bilməzsən")

    existing = db.query(PostReport).filter(
        PostReport.post_id == post_id,
        PostReport.reporter_id == current_user.id,
        PostReport.resolved == False,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu postu artıq şikayət etmisən")

    reason = data.reason.strip() if data.reason else None
    report = PostReport(post_id=post_id, reporter_id=current_user.id, reason=reason)
    db.add(report)
    db.commit()
    return {"message": "Şikayət göndərildi"}


@router.post("/{post_id}/pin")
def pin_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalnız admin pin edə bilər")

    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post tapılmadı")

    post.is_pinned = not post.is_pinned
    db.commit()
    return {"message": "Pin statusu dəyişdirildi", "is_pinned": post.is_pinned}

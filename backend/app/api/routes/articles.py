from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload, subqueryload
from pydantic import BaseModel
from app.services.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.article import Article, ArticleLike, ArticleComment
import math

router = APIRouter(prefix="/api/articles", tags=["articles"])


class ArticleCreate(BaseModel):
    title: str
    subtitle: str | None = None
    content: str
    cover_image: str | None = None


class ArticleUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    content: str | None = None
    cover_image: str | None = None


class CommentCreate(BaseModel):
    content: str


class ArticleResponse(BaseModel):
    id: int
    title: str
    subtitle: str | None
    content: str
    cover_image: str | None
    read_time: int
    created_at: str | None
    updated_at: str | None
    author_id: int
    author_name: str
    author_picture: str | None
    like_count: int
    comment_count: int
    is_liked: bool

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    id: int
    title: str
    subtitle: str | None
    cover_image: str | None
    read_time: int
    created_at: str | None
    author_id: int
    author_name: str
    author_picture: str | None
    like_count: int
    comment_count: int
    preview: str | None

    class Config:
        from_attributes = True


class CommentResponse(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_picture: str | None
    content: str
    created_at: str | None

    class Config:
        from_attributes = True


def _calc_read_time(content: str) -> int:
    words = len(content.split())
    return max(1, math.ceil(words / 200))


def _strip_html(html: str, max_len: int = 160) -> str:
    import re
    text = re.sub(r"<[^>]+>", "", html)
    text = text.strip()
    if len(text) > max_len:
        return text[:max_len].rsplit(" ", 1)[0] + "..."
    return text


@router.get("", response_model=list[ArticleListResponse])
def get_articles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    articles = (
        db.query(Article)
        .filter(Article.is_published == True)
        .options(joinedload(Article.author), subqueryload(Article.likes), subqueryload(Article.comments))
        .order_by(Article.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        ArticleListResponse(
            id=a.id,
            title=a.title,
            subtitle=a.subtitle,
            cover_image=a.cover_image,
            read_time=a.read_time,
            created_at=str(a.created_at) if a.created_at else None,
            author_id=a.author_id,
            author_name=a.author.full_name,
            author_picture=a.author.profile_picture,
            like_count=len(a.likes),
            comment_count=len(a.comments),
            preview=_strip_html(a.content),
        )
        for a in articles
    ]


@router.get("/user/{user_id}", response_model=list[ArticleListResponse])
def get_user_articles(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    articles = (
        db.query(Article)
        .filter(Article.author_id == user_id, Article.is_published == True)
        .options(joinedload(Article.author), subqueryload(Article.likes), subqueryload(Article.comments))
        .order_by(Article.created_at.desc())
        .all()
    )
    return [
        ArticleListResponse(
            id=a.id,
            title=a.title,
            subtitle=a.subtitle,
            cover_image=a.cover_image,
            read_time=a.read_time,
            created_at=str(a.created_at) if a.created_at else None,
            author_id=a.author_id,
            author_name=a.author.full_name,
            author_picture=a.author.profile_picture,
            like_count=len(a.likes),
            comment_count=len(a.comments),
            preview=_strip_html(a.content),
        )
        for a in articles
    ]


@router.get("/{article_id}", response_model=ArticleResponse)
def get_article(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    article = (
        db.query(Article)
        .filter(Article.id == article_id)
        .options(joinedload(Article.author), subqueryload(Article.likes), subqueryload(Article.comments))
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Məqalə tapılmadı")

    is_liked = db.query(ArticleLike).filter(
        ArticleLike.article_id == article_id, ArticleLike.user_id == current_user.id
    ).first() is not None

    return ArticleResponse(
        id=article.id,
        title=article.title,
        subtitle=article.subtitle,
        content=article.content,
        cover_image=article.cover_image,
        read_time=article.read_time,
        created_at=str(article.created_at) if article.created_at else None,
        updated_at=str(article.updated_at) if article.updated_at else None,
        author_id=article.author_id,
        author_name=article.author.full_name,
        author_picture=article.author.profile_picture,
        like_count=len(article.likes),
        comment_count=len(article.comments),
        is_liked=is_liked,
    )


@router.post("", response_model=dict)
def create_article(data: ArticleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not data.title.strip():
        raise HTTPException(status_code=400, detail="Başlıq boş ola bilməz")
    if not data.content.strip():
        raise HTTPException(status_code=400, detail="Mətn boş ola bilməz")

    article = Article(
        author_id=current_user.id,
        title=data.title.strip(),
        subtitle=data.subtitle.strip() if data.subtitle else None,
        content=data.content,
        cover_image=data.cover_image,
        read_time=_calc_read_time(data.content),
    )
    db.add(article)
    db.commit()
    return {"message": "Məqalə yaradıldı", "id": article.id}


@router.put("/{article_id}", response_model=dict)
def update_article(article_id: int, data: ArticleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Məqalə tapılmadı")
    if article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="İcazə yoxdur")

    if data.title is not None:
        article.title = data.title.strip()
    if data.subtitle is not None:
        article.subtitle = data.subtitle.strip() if data.subtitle else None
    if data.content is not None:
        article.content = data.content
        article.read_time = _calc_read_time(data.content)
    if data.cover_image is not None:
        article.cover_image = data.cover_image or None

    db.commit()
    return {"message": "Məqalə yeniləndi"}


@router.delete("/{article_id}", response_model=dict)
def delete_article(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Məqalə tapılmadı")
    if article.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="İcazə yoxdur")

    db.delete(article)
    db.commit()
    return {"message": "Məqalə silindi"}


@router.post("/{article_id}/like", response_model=dict)
def toggle_like(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Məqalə tapılmadı")

    existing = db.query(ArticleLike).filter(
        ArticleLike.article_id == article_id, ArticleLike.user_id == current_user.id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Like silindi"}
    else:
        db.add(ArticleLike(article_id=article_id, user_id=current_user.id))
        db.commit()
        return {"message": "Like əlavə olundu"}


@router.get("/{article_id}/comments", response_model=list[CommentResponse])
def get_comments(article_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    comments = (
        db.query(ArticleComment)
        .filter(ArticleComment.article_id == article_id)
        .options(joinedload(ArticleComment.user))
        .order_by(ArticleComment.created_at.asc())
        .all()
    )
    return [
        CommentResponse(
            id=c.id,
            user_id=c.user_id,
            user_name=c.user.full_name,
            user_picture=c.user.profile_picture,
            content=c.content,
            created_at=str(c.created_at) if c.created_at else None,
        )
        for c in comments
    ]


@router.post("/{article_id}/comment", response_model=dict)
def add_comment(article_id: int, data: CommentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Məqalə tapılmadı")

    comment = ArticleComment(article_id=article_id, user_id=current_user.id, content=data.content.strip())
    db.add(comment)
    db.commit()
    return {"message": "Şərh əlavə olundu"}

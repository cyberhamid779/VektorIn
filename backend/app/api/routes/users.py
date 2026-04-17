from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.services.database import get_db
from app.services.auth import get_current_user
from app.services.activity_logger import log_activity
from app.models.user import User

router = APIRouter(prefix="/api/users", tags=["users"])


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    headline: str | None
    major: str | None
    course: int | None
    bio: str | None
    profile_picture: str | None
    phone: str | None
    github_url: str | None
    linkedin_url: str | None
    website_url: str | None
    skills: str | None
    certificates: str | None
    is_open_for_team: bool
    is_admin: bool

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    headline: str | None = None
    major: str | None = None
    course: int | None = None
    bio: str | None = None
    profile_picture: str | None = None
    phone: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None
    website_url: str | None = None
    skills: str | None = None
    certificates: str | None = None
    is_open_for_team: bool | None = None


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    data: UpdateProfileRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    changes = data.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)

    if "profile_picture" in changes:
        log_activity(
            db,
            action="profile_picture_update",
            user_id=current_user.id,
            email=current_user.email,
            request=request,
            details=changes["profile_picture"],
        )

    return current_user


@router.get("/search", response_model=list[UserResponse])
def search_users(
    q: str = "",
    skill: str = "",
    major: str = "",
    open_for_team: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(User).filter(User.is_active == True, User.id != current_user.id)

    if q:
        query = query.filter(User.full_name.ilike(f"%{q}%"))
    if skill:
        query = query.filter(User.skills.ilike(f"%{skill}%"))
    if major:
        query = query.filter(User.major.ilike(f"%{major}%"))
    if open_for_team:
        query = query.filter(User.is_open_for_team == True)

    return query.limit(50).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")
    return user

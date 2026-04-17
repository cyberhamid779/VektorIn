from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from app.services.database import get_db
from app.services.auth import hash_password, verify_password, create_access_token
from app.services.activity_logger import log_activity
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    major: str | None = None
    course: int | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    if not data.email.endswith("@naa.edu.az"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yalnız @naa.edu.az email ilə qeydiyyat mümkündür"
        )

    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email artıq qeydiyyatdan keçib"
        )

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        major=data.major,
        course=data.course,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(db, action="register", user_id=user.id, email=user.email, request=request)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        log_activity(db, action="login_failed", email=data.email, request=request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email və ya şifrə yanlışdır"
        )

    log_activity(db, action="login_success", user_id=user.id, email=user.email, request=request)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)

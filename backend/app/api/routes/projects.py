from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.services.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.project import Project

router = APIRouter(prefix="/api/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    title: str
    description: str | None = None
    github_url: str | None = None
    technologies: str | None = None
    image_url: str | None = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    github_url: str | None
    technologies: str | None
    image_url: str | None

    class Config:
        from_attributes = True


@router.post("", response_model=ProjectResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = Project(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        github_url=data.github_url,
        technologies=data.technologies,
        image_url=data.image_url,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/me", response_model=list[ProjectResponse])
def get_my_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()


@router.get("/user/{user_id}", response_model=list[ProjectResponse])
def get_user_projects(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).all()


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Layihe tapilmadi")
    db.delete(project)
    db.commit()
    return {"detail": "Layihe silindi"}

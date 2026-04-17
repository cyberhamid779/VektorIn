from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.services.database import get_db
from app.services.auth import get_current_user
from app.models.user import User
from app.models.event import Event

router = APIRouter(prefix="/api/events", tags=["events"])


class EventCreate(BaseModel):
    title: str
    description: str | None = None
    event_date: datetime
    location: str | None = None
    image_url: str | None = None


class EventResponse(BaseModel):
    id: int
    title: str
    description: str | None
    event_date: datetime
    location: str | None
    image_url: str | None
    created_by: int
    creator_name: str | None = None

    class Config:
        from_attributes = True


@router.get("", response_model=list[EventResponse])
def get_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    events = db.query(Event).order_by(Event.event_date.asc()).all()
    result = []
    for e in events:
        data = EventResponse.model_validate(e)
        data.creator_name = e.creator.full_name if e.creator else None
        result.append(data)
    return result


@router.post("", response_model=EventResponse)
def create_event(data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalniz adminler tedbir yarada biler")
    event = Event(
        title=data.title,
        description=data.description,
        event_date=data.event_date,
        location=data.location,
        image_url=data.image_url,
        created_by=current_user.id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    resp = EventResponse.model_validate(event)
    resp.creator_name = current_user.full_name
    return resp


@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yalniz adminler tedbir sile biler")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Tedbir tapilmadi")
    db.delete(event)
    db.commit()
    return {"detail": "Tedbir silindi"}

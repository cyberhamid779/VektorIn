#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python -c "
from app.services.database import engine
from app.models.base import Base
from app.models.user import User
from app.models.post import Post, PostLike, Comment
from app.models.connection import Connection
from app.models.message import Message
from app.models.certificate import Certificate
from app.models.project import Project
from app.models.event import Event
from app.models.activity_log import ActivityLog
Base.metadata.create_all(bind=engine)
print('Tables created successfully')
"

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
Base.metadata.create_all(bind=engine)
print('Tables created successfully')
"

"""add user faculty column

Revision ID: g7h8i9j0k1l2
Revises: f6g7h8i9j0k1
Create Date: 2026-04-20

"""
from alembic import op
import sqlalchemy as sa


revision = "g7h8i9j0k1l2"
down_revision = "f6g7h8i9j0k1"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("users", sa.Column("faculty", sa.String(255), nullable=True))


def downgrade():
    op.drop_column("users", "faculty")

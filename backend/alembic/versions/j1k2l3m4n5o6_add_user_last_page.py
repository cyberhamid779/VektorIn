"""add last_page to users

Revision ID: j1k2l3m4n5o6
Revises: i9j0k1l2m3n4
Create Date: 2026-05-06

"""
from alembic import op
import sqlalchemy as sa

revision = 'j1k2l3m4n5o6'
down_revision = 'i9j0k1l2m3n4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('last_page', sa.String(255), nullable=True))


def downgrade():
    op.drop_column('users', 'last_page')

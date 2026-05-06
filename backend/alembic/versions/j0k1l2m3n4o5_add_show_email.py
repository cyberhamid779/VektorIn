"""add show_email to users

Revision ID: j0k1l2m3n4o5
Revises: i9j0k1l2m3n4
Create Date: 2026-05-06

"""
from alembic import op
import sqlalchemy as sa

revision = 'j0k1l2m3n4o5'
down_revision = 'i9j0k1l2m3n4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('show_email', sa.Boolean(), nullable=True, server_default='false'))


def downgrade():
    op.drop_column('users', 'show_email')

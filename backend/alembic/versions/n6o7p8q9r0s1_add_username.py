"""add username to users

Revision ID: n6o7p8q9r0s1
Revises: m4n5o6p7q8r9
Create Date: 2026-05-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'n6o7p8q9r0s1'
down_revision = 'm4n5o6p7q8r9'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = [c['name'] for c in inspector.get_columns('users')]
    if 'username' not in columns:
        op.add_column('users', sa.Column('username', sa.String(30), nullable=True))
        op.create_index('ix_users_username', 'users', ['username'], unique=True)


def downgrade():
    op.drop_index('ix_users_username', table_name='users')
    op.drop_column('users', 'username')

"""add indexes on messages table

Revision ID: o7p8q9r0s1t2
Revises: n6o7p8q9r0s1
Create Date: 2026-05-31
"""
from alembic import op

revision = 'o7p8q9r0s1t2'
down_revision = 'n6o7p8q9r0s1'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_messages_sender_receiver_created
        ON messages (sender_id, receiver_id, created_at DESC)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_messages_receiver_sender_created
        ON messages (receiver_id, sender_id, created_at DESC)
    """)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_messages_receiver_unread
        ON messages (receiver_id, is_read) WHERE is_read = FALSE
    """)


def downgrade():
    op.execute("DROP INDEX IF EXISTS ix_messages_sender_receiver_created")
    op.execute("DROP INDEX IF EXISTS ix_messages_receiver_sender_created")
    op.execute("DROP INDEX IF EXISTS ix_messages_receiver_unread")

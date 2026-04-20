"""add post_dislikes table and show_dislikes column

Revision ID: h8i9j0k1l2m3
Revises: g7h8i9j0k1l2
Create Date: 2026-04-20

"""
from alembic import op
import sqlalchemy as sa


revision = "h8i9j0k1l2m3"
down_revision = "g7h8i9j0k1l2"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "post_dislikes",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("post_id", sa.Integer(), sa.ForeignKey("posts.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.add_column("posts", sa.Column("show_dislikes", sa.Boolean(), server_default=sa.text("true")))


def downgrade():
    op.drop_column("posts", "show_dislikes")
    op.drop_table("post_dislikes")

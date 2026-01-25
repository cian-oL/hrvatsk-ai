"""
Session database model.
"""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from hrvatsk_ai_api.infrastructure.database import Base

if TYPE_CHECKING:
    from hrvatsk_ai_api.infrastructure.database import User


class SessionStatus(enum.Enum):
    """
    Session lifecycle states.
    """

    CREATED = "created"
    PLANNING = "planning"
    ACTIVE = "active"
    QUIZZING = "quizzing"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class Session(Base):
    """
    Learning session with lesson plan and outcomes.
    """

    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus), default=SessionStatus.CREATED
    )

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    time_allocation_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    lesson_plan: Mapped[dict | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="sessions")

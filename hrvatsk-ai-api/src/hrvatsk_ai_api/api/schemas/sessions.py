"""
Session-related request/response schemas.
"""

from typing import Literal

from pydantic import BaseModel, Field

from hrvatsk_ai_api.agents.lesson_planner.core import LessonPlan


class CreateSessionRequest(BaseModel):
    """
    Request body for creating a new session.
    """

    time_allocation_minutes: int = Field(gt=0, le=60, default=15)
    focus_preference: Literal["balanced", "vocabulary", "grammar", "conversation"] = (
        "balanced"
    )


class SessionResponse(BaseModel):
    """
    Response for session data.
    """

    id: str
    status: Literal[
        "created", "planning", "active", "quizzing", "completed", "abandoned"
    ]
    time_allocation_minutes: int
    started_at: str
    lesson_plan: LessonPlan | None = None
    message: str | None = None


class CreateSessionResponse(BaseModel):
    """
    Response for POST /sessions.
    """

    success: bool = True
    data: SessionResponse

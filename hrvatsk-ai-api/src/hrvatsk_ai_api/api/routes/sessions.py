"""
Sessions API routes.
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from hrvatsk_ai_api.agents.lesson_planner.workflows.graph import lesson_planner_graph
from hrvatsk_ai_api.api.schemas.sessions import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionResponse,
)
from hrvatsk_ai_api.infrastructure.database import Session as SessionModel
from hrvatsk_ai_api.infrastructure.database import SessionStatus, User, get_session

router = APIRouter(prefix="/sessions", tags=["sessions"])


async def get_or_create_dev_user(db: AsyncSession) -> User:
    """Get or create a development user. Replace with Clerk auth later."""
    dev_clerk_id = "dev_user_001"
    result = await db.execute(select(User).where(User.clerk_id == dev_clerk_id))
    user = result.scalar_one_or_none()

    if not user:
        user = User(clerk_id=dev_clerk_id, current_level="A1")
        db.add(user)
        await db.flush()

    return user


@router.post("", response_model=CreateSessionResponse, status_code=201)
async def create_session(
    request: CreateSessionRequest,
    db: AsyncSession = Depends(get_session),
) -> CreateSessionResponse:
    """
    Start a new learning session.
    Creates a session and generates a lesson plan using the Lesson Planner agent.

    Args:
        request (CreateSessionRequest): Session configuration (time allocation, focus preference).

    Returns:
        Session data with generated lesson plan (CreateSessionResponse).
    """
    user = await get_or_create_dev_user(db)
    started_at = datetime.now(timezone.utc)

    # Run the lesson planner
    initial_state = {
        "user_level": user.current_level,
        "time_allocation_minutes": request.time_allocation_minutes,
        "focus_preference": request.focus_preference,
        "lesson_plan": None,
        "raw_response": None,
        "error": None,
    }

    result = lesson_planner_graph.invoke(initial_state)

    if result["error"]:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate lesson plan: {result['error']}",
        )

    # Create session in database
    session = SessionModel(
        user_id=user.id,
        status=SessionStatus.ACTIVE,
        time_allocation_minutes=request.time_allocation_minutes,
        started_at=started_at,
        lesson_plan=result["lesson_plan"].model_dump()
        if result["lesson_plan"]
        else None,
    )
    db.add(session)
    await db.flush()

    return CreateSessionResponse(
        success=True,
        data=SessionResponse(
            id=str(session.id),
            status="active",
            time_allocation_minutes=request.time_allocation_minutes,
            started_at=started_at.isoformat(),
            lesson_plan=result["lesson_plan"],
            message="Lesson plan generated successfully",
        ),
    )


@router.get("/{session_id}", response_model=CreateSessionResponse)
async def get_session_by_id(
    session_id: UUID,
    db: AsyncSession = Depends(get_session),
) -> CreateSessionResponse:
    """
    Get session details and lesson plan.

    Args:
        session_id (UUID): UUID of the session to retrieve

    Returns:
        Session data with lesson plan if available
    """
    result = await db.execute(select(SessionModel).where(SessionModel.id == session_id))
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return CreateSessionResponse(
        success=True,
        data=SessionResponse(
            id=str(session.id),
            status=session.status.value
            if hasattr(session.status, "value")
            else session.status,
            time_allocation_minutes=session.time_allocation_minutes,
            started_at=session.started_at.isoformat() if session.started_at else "",
            lesson_plan=session.lesson_plan,
        ),
    )

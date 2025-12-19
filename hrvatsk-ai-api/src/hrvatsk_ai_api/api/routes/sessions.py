"""
Sessions API routes.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from hrvatsk_ai_api.agents.lesson_planner.workflows.graph import lesson_planner_graph
from hrvatsk_ai_api.api.schemas.sessions import (
    CreateSessionRequest,
    CreateSessionResponse,
    SessionResponse,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])

# In-memory session store
_sessions: dict[str, dict] = {}


@router.post("", response_model=CreateSessionResponse, status_code=201)
async def create_session(request: CreateSessionRequest) -> CreateSessionResponse:
    """
    Start a new learning session.
    Creates a session and generates a lesson plan using the Lesson Planner agent.

    Args:
        request (CreateSessionRequest): Session configuration (time allocation, focus preference).

    Returns:
        Session data with generated lesson plan (CreateSessionResponse).
    """

    session_id = str(uuid.uuid4())
    started_at = datetime.now(timezone.utc)

    # Run the lesson planner
    initial_state = {
        "user_level": "A1",  # TODO: Get from user profile once auth is set up
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

    # Store session
    session_data = {
        "id": session_id,
        "status": "active",
        "time_allocation_minutes": request.time_allocation_minutes,
        "started_at": started_at.isoformat(),
        "lesson_plan": result["lesson_plan"],
    }

    _sessions[session_id] = session_data

    return CreateSessionResponse(
        success=True,
        data=SessionResponse(
            id=session_id,
            status="active",
            time_allocation_minutes=request.time_allocation_minutes,
            started_at=started_at.isoformat(),
            lesson_plan=result["lesson_plan"],
            message="Lesson plan generated successfully",
        ),
    )


@router.get("/{session_id}", response_model=CreateSessionResponse)
async def get_session(session_id: str) -> CreateSessionResponse:
    """
    Get session details and lesson plan.

    Args:
        session_id (str): UUID of the session to retrieve

    Returns:
        Session data with lesson plan if available
    """

    if session_id not in _sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session_data = _sessions[session_id]

    return CreateSessionResponse(
        success=True,
        data=SessionResponse(
            id=session_data["id"],
            status=session_data["status"],
            time_allocation_minutes=session_data["time_allocation_minutes"],
            started_at=session_data["started_at"],
            lesson_plan=session_data["lesson_plan"],
        ),
    )

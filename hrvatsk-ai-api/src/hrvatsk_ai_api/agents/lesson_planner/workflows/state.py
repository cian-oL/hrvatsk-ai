"""
State class for the LangGraph workflow.
"""

from typing import TypedDict

from hrvatsk_ai_api.agents.lesson_planner.core import LessonPlan


class LessonPlannerState(TypedDict):
    """
    State for the lesson planner graph.

    Args:
        TypedDict (_type_): A typed namespace for the class.
    """

    # Input
    user_level: str
    time_allocation_minutes: int
    focus_preference: str

    # Output
    lesson_plan: LessonPlan | None
    raw_response: str | None
    error: str | None
    error: str | None

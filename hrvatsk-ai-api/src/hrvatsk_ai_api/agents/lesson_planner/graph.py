"""
LangGraph workflow for the Lesson Planner agent.
"""

import json
from typing import TypedDict

from langgraph.graph import END, StateGraph

from hrvatsk_ai_api.agents.lesson_planner.prompts.agent import SYSTEM_PROMPT
from hrvatsk_ai_api.agents.lesson_planner.schemas import LessonPlan
from hrvatsk_ai_api.core.llm import completion


class PlannerState(TypedDict):
    """State for the lesson planner graph."""

    # Input
    user_level: str
    time_allocation_minutes: int
    focus_preference: str

    # Output
    lesson_plan: LessonPlan | None
    raw_response: str | None
    error: str | None


def generate_lesson_plan(state: PlannerState) -> PlannerState:
    """Call LLM to generate a lesson plan."""
    user_prompt = f"""Create a lesson plan for the following learner:

LEARNER PROFILE:
- Current Level: {state["user_level"]}
- Native Language: English

SESSION PARAMETERS:
- Time Available: {state["time_allocation_minutes"]} minutes
- Focus Preference: {state["focus_preference"]}

Generate a complete lesson plan following the schema provided."""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    try:
        response = completion(
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        state["raw_response"] = response

        # Parse and validate with Pydantic
        plan_data = json.loads(response)
        state["lesson_plan"] = LessonPlan.model_validate(plan_data)
        state["error"] = None

    except json.JSONDecodeError as e:
        state["error"] = f"Failed to parse JSON: {e}"
        state["lesson_plan"] = None
    except Exception as e:
        state["error"] = f"Error generating lesson plan: {e}"
        state["lesson_plan"] = None

    return state


def build_graph() -> StateGraph:
    """Build and compile the lesson planner graph."""
    graph = StateGraph(PlannerState)

    graph.add_node("generate", generate_lesson_plan)

    graph.set_entry_point("generate")
    graph.add_edge("generate", END)

    return graph.compile()


# Compiled graph instance
lesson_planner_graph = build_graph()

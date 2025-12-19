#!/usr/bin/env python3
"""
Test script for the Lesson Planner agent.

Run from the hrvatsk-ai-api directory:
    uv run python scripts/test_lesson_planner.py
"""

import json

from dotenv import load_dotenv

from hrvatsk_ai_api.agents.lesson_planner.core import LessonPlan
from hrvatsk_ai_api.agents.lesson_planner.workflows.graph import lesson_planner_graph

# Load .env from project root
load_dotenv("../.env")


def main():
    print("=" * 60)
    print("Testing Lesson Planner Agent")
    print("=" * 60)

    # Sample input
    initial_state = {
        "user_level": "A1",
        "time_allocation_minutes": 15,
        "focus_preference": "vocabulary",
        "lesson_plan": None,
        "raw_response": None,
        "error": None,
    }

    print("\nInput:")
    print(f"  Level: {initial_state['user_level']}")
    print(f"  Time: {initial_state['time_allocation_minutes']} minutes")
    print(f"  Focus: {initial_state['focus_preference']}")
    print("\nGenerating lesson plan...")

    # Run the graph
    result = lesson_planner_graph.invoke(initial_state)

    if result["error"]:
        print(f"\n❌ Error: {result['error']}")
        if result["raw_response"]:
            print(f"\nRaw response:\n{result['raw_response'][:500]}...")
        return

    print("\n✅ Lesson plan generated successfully!")

    plan: LessonPlan = result["lesson_plan"]
    print("\n--- Lesson Plan ---")
    print(f"Duration: {plan.session_duration_minutes} minutes")
    print(f"Level: {plan.level}")

    print("\nObjectives:")
    for obj in plan.objectives:
        print(f"  [{obj.priority}] {obj.description}")

    print(f"\nVocabulary Targets ({len(plan.vocabulary_targets)} words):")
    for vocab in plan.vocabulary_targets[:5]:  # Show first 5
        print(f"  - {vocab.word} ({vocab.translation})")
    if len(plan.vocabulary_targets) > 5:
        print(f"  ... and {len(plan.vocabulary_targets) - 5} more")

    print(f"\nGrammar Focus: {plan.grammar_focus.concept}")
    print(f"  Level: {plan.grammar_focus.level}")

    print(f"\nScenario: {plan.conversation_scenario.setting}")
    print(f"  Student role: {plan.conversation_scenario.student_role}")
    print(f"  Tutor role: {plan.conversation_scenario.tutor_role}")

    print("\nSuccess Criteria:")
    for criterion in plan.success_criteria:
        print(f"  • {criterion}")

    # Also dump full JSON for inspection
    print("\n--- Full JSON ---")
    print(json.dumps(plan.model_dump(), indent=2))


if __name__ == "__main__":
    main()

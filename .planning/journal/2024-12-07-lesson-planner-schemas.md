# 2024-12-07: Lesson Planner Pydantic Schemas

## Context

Building the lesson-planner agent. Need to define structured output schemas for the LLM to generate lesson plans.

## Decision

Using Pydantic models (Option B) rather than inline JSON schema in prompts or separate JSON files.

**Rationale:**

- Single source of truth for schema definition
- Automatic validation of LLM output
- Type hints for downstream code
- Can generate JSON schema for prompts via `model_json_schema()`
- LangGraph has good Pydantic integration for structured outputs

## Implementation

Created `core/schemas/` directory with:

- `lesson_plan.py` - Main lesson plan output schema with nested models

Models defined:

- `Objective` - Learning objectives with priority and measurable outcomes
- `VocabularyTarget` - Target vocabulary with Croatian-specific fields (gender, case_focus)
- `GrammarFocus` - Grammar concept to practice
- `ConversationScenario` - Role-play scenario details
- `AdaptationTriggers` - When to simplify/advance
- `LessonPlan` - Top-level model combining all above

## Notes

- Schema follows AGENT_PROMPTS.md spec exactly
- Using `Literal` for enums (CEFR levels, grammar focus levels)
- Optional fields where spec indicates they may be absent

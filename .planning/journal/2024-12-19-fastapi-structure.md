# 2024-12-19: FastAPI Structure & Architecture Decisions

## Context

Set up FastAPI routes and API layer to connect to the Lesson Planner agent.

## Structure Created

```
src/hrvatsk_ai_api/
├── main.py                 # FastAPI app entry point
├── api/
│   ├── routes/
│   │   ├── health.py       # GET /api/v1/health
│   │   └── sessions.py     # POST/GET /api/v1/sessions
│   └── schemas/
│       └── sessions.py     # Request/response Pydantic models
├── agents/
│   └── lesson_planner/     # Domain logic
└── infrastructure/
    └── llm/                # LLM client
```

## Architecture Decisions

### Layer Separation

- **api/** — presentation layer (HTTP interface)
- **agents/** — application/domain layer (business logic)
- **infrastructure/** — technical concerns (LLM, database, external services)

### API Schemas vs Domain Models

Discussed whether `api/schemas/` should be separate from `agents/*/core/`.

**Decision:** Keep separate.

- `core/lesson_plan.py` — domain model (what a lesson plan _is_)
- `api/schemas/sessions.py` — HTTP contract (request/response shapes)

The API schemas wrap domain models and add HTTP-specific concerns (success flags, status, messages). Separation allows API contract to evolve independently.

### LangGraph `.invoke()` Method

`lesson_planner_graph` is a `CompiledStateGraph` returned by `graph.compile()`. The `.invoke()` method is inherited from LangGraph, not defined in our code. Our `generate_lesson_plan` function is registered as a node that LangGraph calls.

## Endpoints Implemented

| Method | Path                    | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| GET    | `/api/v1/health`        | Health check                          |
| POST   | `/api/v1/sessions`      | Create session + generate lesson plan |
| GET    | `/api/v1/sessions/{id}` | Get session details                   |

## Notes

- Sessions stored in-memory for now (no database yet)
- User level hardcoded to "A1" until auth is wired up
- Using `fastapi[standard]` which includes uvicorn

# Hrvatsk-AI TODO

## Current Sprint: Database Integration

### Completed

- [x] Lesson Planner agent with LangGraph workflow
- [x] Pydantic schemas for lesson plan output
- [x] LLM client with LiteLLM
- [x] Set up FastAPI app structure (main.py, routers)
- [x] Create sessions router with POST /sessions endpoint
- [x] Create GET /sessions/:id endpoint
- [x] Add health check endpoint
- [x] Test the API endpoints
- [x] Set up SQLAlchemy with async support (asyncpg)
- [x] Create User and Session database models
- [x] Initialize Alembic for migrations
- [x] Integrate database into sessions router

### In Progress

- [x] Run migrations and test with real PostgreSQL database

## Backlog

### Agents

- [ ] Tutor agent (conversational teaching)
- [ ] Quiz Generator agent

### Database

- [ ] Vocabulary and grammar models
- [ ] User vocabulary progress tracking

### Auth

- [ ] Clerk JWT verification middleware

### Frontend

- [ ] Next.js app setup

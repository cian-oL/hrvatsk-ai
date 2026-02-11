# 2025-02-11: Frontend Prototype Planning

## Context

Mr Anderson requested planning for the Next.js frontend prototype. Backend already has:

- Lesson Planner agent with LangGraph workflow
- FastAPI with sessions router (POST/GET /sessions)
- SQLAlchemy models for User and Session
- Migrations working with PostgreSQL

## Decisions Made

### Next.js Version: 15 (not 14)

Mr Anderson asked why not use the latest. Trade-offs considered:

- Next 15 has cleaner caching model (explicit opt-in)
- React 19 support with new hooks
- Stable Turbopack for dev
- No breaking changes that affect us negatively

**Decision:** Use Next.js 15 for a new project.

### User Data Storage Strategy

Problem: `/users/me` backend endpoint doesn't exist yet, but frontend needs to store:

- CEFR level selection
- Native language
- Session preferences
- Onboarding completion status

Options discussed:

1. Build backend endpoints first
2. Use Clerk user metadata
3. Use localStorage

**Decision:** Store in Clerk `publicMetadata` for prototype. Tech debt to sync with backend when `/users/me` is ready.

### Onboarding Flow

```
Clerk Sign-Up → Redirect to /onboarding →
  User fills preferences → Save to Clerk metadata →
  Redirect to /learn
```

When backend `/users/me` exists, first authenticated API call will create the user record.

## Tech Stack Finalized

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk (auth + user metadata storage)
- Tanstack Query (API calls)

## Plan Location

Plan documented at `.planning/FRONTEND-PROTOTYPE.md` (Mr Anderson moved/renamed it).

## Ten Implementation Phases

1. Project setup & layout
2. Authentication flow (Clerk)
3. Landing page
4. Onboarding
5. API integration layer
6. Learn page & session creation
7. Chat interface (with real lesson plans)
8. Quiz UI (mock data)
9. Progress dashboard (mock data)
10. Polish & testing

## APIs Available vs Mock

| Feature        | API Status            | Frontend Strategy |
| -------------- | --------------------- | ----------------- |
| Sessions       | ✅ POST/GET /sessions | Wire up real API  |
| Messages       | ❌ Not built          | Mock conversation |
| Quiz submit    | ❌ Not built          | Mock results      |
| User profile   | ❌ Not built          | Clerk metadata    |
| Progress stats | ❌ Not built          | Mock data         |

## Notes

- Clerk is already set up by Mr Anderson
- Color scheme: clean blue/gray (no specific preference given)
- English-only UI for prototype

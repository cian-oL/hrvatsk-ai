# Hrvatsk-AI Architecture Document

## Overview

Hrvatsk-AI is a conversational Croatian language learning application that uses LLM-powered agents to deliver personalized, adaptive lessons. The system consists of a Next.js frontend, FastAPI backend with intelligent agents, and PostgreSQL for persistence.

## Design Philosophy

### Core Principles

1. **Two-Phase Session Model**: Rather than complex multi-agent orchestration, we use temporal separation. A Lesson Planner runs once at session start, while a Tutor Agent handles conversation.

2. **Adaptive Learning**: The tutor can deviate from the lesson plan based on user performance, making the experience responsive rather than rigid.

3. **Croatian-Specific Design**: The data model and prompts account for Croatian grammatical cases, verb aspects, and other language-specific challenges.

4. **Cost Efficiency**: Minimize LLM calls through smart session management and context summarization.

5. **LLM Provider Agnostic**: Use LiteLLM abstraction to support multiple providers (Claude, GPT-4, Gemini, local models) via configuration.

6. **Delegated Authentication**: Use Clerk for user authentication to simplify security and provide a polished auth experience.

### CEFR Framework

This application uses the **Common European Framework of Reference for Languages (CEFR)** - the international standard for describing language ability:

| Level  | Name         | Description                                                                    |
| ------ | ------------ | ------------------------------------------------------------------------------ |
| **A1** | Breakthrough | Can understand and use familiar everyday expressions and basic phrases         |
| **A2** | Waystage     | Can communicate in simple, routine tasks on familiar topics                    |
| **B1** | Threshold    | Can deal with most situations likely to arise while traveling                  |
| **B2** | Vantage      | Can interact with a degree of fluency with native speakers                     |
| **C1** | Advanced     | Can use language flexibly and effectively for social and professional purposes |
| **C2** | Mastery      | Can understand virtually everything heard or read with ease                    |

All vocabulary and grammar concepts in the system are tagged with their CEFR level based on established Croatian language curricula.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         Vercel - Next.js 14                             │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Onboarding  │  │   Chat UI    │  │  Quiz Modal  │  │  Progress   │ │
│  │    Flow      │  │  Streaming   │  │              │  │  Dashboard  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTPS / SSE
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                      Railway - FastAPI + Python                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         API Layer                                 │  │
│  │  /api/users  │  /api/sessions  │  /api/messages  │  /api/quiz    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 │                                        │
│  ┌──────────────────────────────┴───────────────────────────────────┐  │
│  │                      Session Manager                              │  │
│  │  - Orchestrates session lifecycle                                 │  │
│  │  - Coordinates agents                                             │  │
│  │  - Manages conversation context                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 │                                        │
│  ┌──────────────────────────────┴───────────────────────────────────┐  │
│  │                       Agent Layer                                 │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │  │
│  │  │   Lesson    │  │    Tutor    │  │    Quiz     │               │  │
│  │  │   Planner   │  │    Agent    │  │  Generator  │               │  │
│  │  │ (1x/session)│  │ (per msg)   │  │ (1x/session)│               │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                 │                                        │
│  ┌──────────────────────────────┴───────────────────────────────────┐  │
│  │                       Core Services                               │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │  │
│  │  │   Vocabulary    │  │    Adaptive     │  │     Context     │   │  │
│  │  │    Tracker      │  │    Monitor      │  │   Summarizer    │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────┐      ┌──────────────────────────────────┐│
│  │    LLM Provider          │      │        Neon PostgreSQL           ││
│  │    (e.g. Claude)         │      │        (Database)                ││
│  └──────────────────────────┘      └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend (Next.js)

**Responsibilities:**

- User authentication (via Clerk)
- Onboarding and level selection
- Real-time chat interface with streaming
- Quiz presentation
- Progress visualization

**Key Features:**

- Server-Side Rendering for initial load
- Client-side streaming for chat responses
- Responsive design (mobile-first)
- Accessibility compliance
- Clerk pre-built auth components

**Routes:**
| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/` | Landing page | No |
| `/sign-in` | Clerk sign-in page | No |
| `/sign-up` | Clerk sign-up page | No |
| `/onboarding` | Level selection and preferences | Yes |
| `/learn` | Main chat interface | Yes |
| `/progress` | Learning dashboard | Yes |

### Authentication with Clerk

Clerk handles all authentication concerns:

```
User Journey:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Landing Page  │────▶│  Clerk Sign-Up  │────▶│   Onboarding    │
│                 │     │   - Email       │     │  - Select Level │
│                 │     │   - Google      │     │  - Preferences  │
│                 │     │   - GitHub      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │    Progress     │◀────│     Learn       │
                        │    Dashboard    │     │   (Chat UI)     │
                        └─────────────────┘     └─────────────────┘
```

**Clerk Integration in Next.js:**

```typescript
// middleware.ts - Protect routes
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

**Frontend Components:**

- `<SignIn />` - Pre-built sign-in form
- `<SignUp />` - Pre-built sign-up form
- `<UserButton />` - User menu with sign-out
- `useUser()` - Hook to get current user
- `useAuth()` - Hook to get auth state and token

### 2. Backend (FastAPI)

**Responsibilities:**

- Verify Clerk JWT tokens
- API endpoints for all frontend needs
- Session lifecycle management
- Agent orchestration via LiteLLM
- Database operations
- Streaming responses via SSE

**Key Design Decisions:**

1. **Async Throughout**: All database and LLM operations are async for scalability.
2. **Dependency Injection**: FastAPI's `Depends()` for clean separation of concerns.
3. **Structured Outputs**: Lesson plans and quiz questions use Pydantic models for LLM structured generation.
4. **Clerk JWT Verification**: Validate tokens using Clerk's public JWKS endpoint.
5. **LiteLLM Abstraction**: Provider-agnostic LLM calls supporting Claude, GPT-4, Gemini, etc.

**Clerk JWT Verification:**

```python
# backend/src/hrvatsk/auth/clerk.py
from fastapi import Depends, HTTPException, Request
from jose import jwt, JWTError
import httpx

CLERK_JWKS_URL = "https://{clerk_domain}/.well-known/jwks.json"

async def get_current_user(request: Request) -> dict:
    """Verify Clerk JWT and return user claims."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")

    token = auth_header.split(" ")[1]

    # Fetch JWKS and verify token
    async with httpx.AsyncClient() as client:
        jwks = await client.get(CLERK_JWKS_URL)
        # ... verify signature and claims

    return {
        "clerk_id": claims["sub"],
        "email": claims.get("email"),
    }

# Usage in routes
@router.get("/users/me")
async def get_me(user: dict = Depends(get_current_user)):
    # user["clerk_id"] is the unique Clerk user ID
    ...
```

**LiteLLM Integration:**

```python
# backend/src/hrvatsk/llm/client.py
import litellm
from litellm import acompletion

# Configure provider via environment variable
# LITELLM_MODEL=claude-3-5-sonnet-20241022
# LITELLM_MODEL=gpt-4-turbo
# LITELLM_MODEL=gemini-pro

async def chat_completion(messages: list, **kwargs):
    """Provider-agnostic LLM completion."""
    response = await acompletion(
        model=settings.LITELLM_MODEL,
        messages=messages,
        **kwargs
    )
    return response

async def stream_completion(messages: list, **kwargs):
    """Provider-agnostic streaming completion."""
    response = await acompletion(
        model=settings.LITELLM_MODEL,
        messages=messages,
        stream=True,
        **kwargs
    )
    async for chunk in response:
        yield chunk
```

### 3. Agent Layer

#### Lesson Planner Agent

**Purpose**: Generate a structured lesson plan at session start.

**Invocation**: Once per session, before conversation begins.

**Input**:

- User profile (level, native language)
- Learning history (known vocabulary, struggled concepts)
- Time available for session
- Previous session objectives (to avoid repetition)

**Output** (Structured JSON):

```json
{
  "session_duration_minutes": 15,
  "level": "A1",
  "objectives": [
    "Practice basic greetings",
    "Learn 5 food vocabulary words",
    "Introduction to accusative case"
  ],
  "vocabulary_targets": [
    {
      "word": "kruh",
      "translation": "bread",
      "part_of_speech": "noun",
      "gender": "masculine",
      "case_focus": "accusative"
    }
  ],
  "grammar_focus": {
    "concept": "accusative_case_nouns",
    "level": "introduce",
    "examples_to_use": ["Želim kruh.", "Vidim vodu."]
  },
  "conversation_scenario": "Ordering food at a bakery",
  "engagement_hooks": ["Ask about favorite foods", "Role-play as shopkeeper"],
  "success_criteria": [
    "User correctly uses 3+ target vocabulary words",
    "User attempts accusative case in 2+ sentences"
  ]
}
```

#### Tutor Agent

**Purpose**: Conduct the conversational lesson, respond to user, provide corrections.

**Invocation**: Every user message during session.

**Input**:

- Current lesson plan
- Conversation history (summarized if long)
- Current user message
- Vocabulary exposure tracker state
- Adaptive monitor signals

**Output** (Streaming text + metadata):

```json
{
  "response_text": "Odlično! 'Kruh' je točno. Sada probaj reći 'Želim vodu.'",
  "vocabulary_used": ["kruh"],
  "corrections": [
    {
      "user_said": "Zelim kruh",
      "should_be": "Želim kruh",
      "explanation": "Don't forget the háček (ˇ) on Ž!"
    }
  ],
  "performance_signal": "on_track",
  "suggested_adaptation": null
}
```

**Adaptive Behavior**:
The tutor monitors a rolling window of exchanges:

- `correct_rate < 0.4` → Struggling → Simplify, more examples, slower pace
- `correct_rate > 0.85` → Excelling → Advance, add bonus content
- `response_length_declining` → Frustration → Encouragement, change topic

#### Quiz Generator Agent

**Purpose**: Generate end-of-session quiz based on covered material.

**Invocation**: Once per session, when user ends or time expires.

**Input**:

- Vocabulary covered in session (with exposure counts)
- Grammar concepts practiced
- User performance metrics

**Output**:

```json
{
  "questions": [
    {
      "id": 1,
      "type": "translate_to_croatian",
      "prompt": "How do you say 'bread' in Croatian?",
      "correct_answer": "kruh",
      "hint": "You ordered this at the bakery!",
      "points": 1
    },
    {
      "id": 2,
      "type": "fill_blank",
      "prompt": "Želim ___. (I want water)",
      "correct_answer": "vodu",
      "grammar_note": "Accusative feminine: -a → -u",
      "points": 2
    },
    {
      "id": 3,
      "type": "multiple_choice",
      "prompt": "Which is correct: 'Vidim' means...",
      "options": ["I see", "I want", "I have", "I go"],
      "correct_answer": "I see",
      "points": 1
    }
  ],
  "pass_threshold": 3,
  "total_points": 4
}
```

### 4. Core Services

#### Session Manager

Orchestrates the complete session lifecycle:

```
Session States:
┌─────────┐    ┌──────────┐    ┌────────────┐    ┌───────────┐    ┌────────┐
│ Created │───▶│ Planning │───▶│   Active   │───▶│  Quizzing │───▶│ Closed │
└─────────┘    └──────────┘    └────────────┘    └───────────┘    └────────┘
     │              │               │  ▲               │
     │              ▼               │  │               │
     │         [Lesson Plan]        │  │               │
     │                              ▼  │               │
     │                         [Conversation           │
     │                          + Adaptation]          │
     │                                                 │
     └─────────────────────────────────────────────────┘
                      (User Abandons)
```

**Responsibilities:**

- Create session with user and time allocation
- Invoke Lesson Planner and store plan
- Route messages to Tutor Agent with context
- Handle adaptive signals from monitor
- Trigger quiz at session end
- Persist all progress to database

#### Vocabulary Tracker

Tracks vocabulary exposure and mastery per user:

- **Exposure Count**: How many times user has seen/used a word
- **Correct Count**: How many times used correctly
- **Mastery Level**: 0 (unknown) to 5 (mastered)
- **SRS Due Date**: When to review (spaced repetition)

**Mastery Calculation:**

```python
def calculate_mastery(exposure: int, correct: int) -> int:
    if exposure == 0:
        return 0
    accuracy = correct / exposure
    if exposure >= 10 and accuracy >= 0.9:
        return 5  # Mastered
    elif exposure >= 7 and accuracy >= 0.8:
        return 4
    elif exposure >= 5 and accuracy >= 0.7:
        return 3
    elif exposure >= 3 and accuracy >= 0.6:
        return 2
    elif exposure >= 1:
        return 1  # Introduced
    return 0
```

#### Adaptive Monitor

Analyzes conversation to detect when lesson plan deviation is needed:

**Signals Tracked:**
| Signal | Threshold | Action |
|--------|-----------|--------|
| Correct rate | < 40% | Simplify content |
| Correct rate | > 85% | Advance difficulty |
| Response length trend | Declining | Encourage, vary approach |
| Time to respond | Increasing | User may be confused |
| Repeated mistakes | Same error 3x | Explicit teaching moment |

## Data Model

### Entity Relationship Diagram

Note: With Clerk handling authentication, our `users` table stores only learning-specific data, linked by `clerk_id`.

```
┌──────────────────┐       ┌──────────────────────┐
│      users       │       │   vocabulary_items   │
├──────────────────┤       ├──────────────────────┤
│ id (PK)          │       │ id (PK)              │
│ clerk_id (UNIQUE)│       │ croatian             │
│ native_language  │       │ english              │
│ current_level    │       │ part_of_speech       │
│ onboarding_done  │       │ gender               │
│ preferences      │       │ case_forms (JSONB)   │
│ created_at       │       │ aspect_pair_id (FK)  │
└────────┬─────────┘       │ cefr_level           │
         │                 │ audio_url            │
         │                 └──────────┬───────────┘
         │                            │
         │    ┌───────────────────────┤
         │    │                       │
         ▼    ▼                       │
┌──────────────────────┐              │
│   user_vocabulary    │              │
├──────────────────────┤              │
│ user_id (FK)         │              │
│ vocabulary_item_id   │◀─────────────┘
│ exposure_count       │
│ correct_count        │
│ mastery_level        │
│ last_seen            │
│ srs_due_date         │
└──────────────────────┘

         │
         ▼
┌──────────────────────┐       ┌──────────────────────┐
│      sessions        │       │      messages        │
├──────────────────────┤       ├──────────────────────┤
│ id (PK)              │       │ id (PK)              │
│ user_id (FK)         │───────│ session_id (FK)      │
│ started_at           │       │ role                 │
│ ended_at             │       │ content              │
│ time_allocation      │       │ corrections (JSONB)  │
│ lesson_plan (JSONB)  │       │ vocabulary_used      │
│ status               │       │ created_at           │
│ quiz_results (JSONB) │       └──────────────────────┘
│ objectives_achieved  │
└──────────────────────┘

┌──────────────────────┐
│   grammar_concepts   │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ cefr_level           │
│ description          │
│ examples (JSONB)     │
│ prerequisites        │
└──────────────────────┘

┌──────────────────────┐
│ user_grammar_progress│
├──────────────────────┤
│ user_id (FK)         │
│ grammar_concept_id   │
│ introduced_at        │
│ practice_count       │
│ mastery_level        │
└──────────────────────┘
```

### Key Schema Details

**vocabulary_items.case_forms** (JSONB):

```json
{
  "nominative": "voda",
  "genitive": "vode",
  "dative": "vodi",
  "accusative": "vodu",
  "vocative": "vodo",
  "locative": "vodi",
  "instrumental": "vodom"
}
```

**sessions.lesson_plan** (JSONB):
Full lesson plan as generated by Lesson Planner agent.

**messages.corrections** (JSONB):

```json
[
  {
    "user_said": "Zelim voda",
    "should_be": "Želim vodu",
    "error_type": "case_error",
    "explanation": "Use accusative case after 'želim'"
  }
]
```

## API Design

### Endpoints

| Method | Path                            | Purpose                           |
| ------ | ------------------------------- | --------------------------------- |
| POST   | `/api/users`                    | Create user account               |
| GET    | `/api/users/me`                 | Get current user profile          |
| PUT    | `/api/users/me`                 | Update preferences                |
| GET    | `/api/users/me/progress`        | Get learning statistics           |
| POST   | `/api/sessions`                 | Start new session                 |
| GET    | `/api/sessions/:id`             | Get session details               |
| POST   | `/api/sessions/:id/messages`    | Send message (returns SSE stream) |
| POST   | `/api/sessions/:id/end`         | End session, trigger quiz         |
| POST   | `/api/sessions/:id/quiz/submit` | Submit quiz answers               |
| GET    | `/api/vocabulary`               | Get vocabulary list with filters  |
| GET    | `/api/vocabulary/review`        | Get words due for SRS review      |

### Streaming Response Format

For `/api/sessions/:id/messages`, response is Server-Sent Events:

```
event: token
data: {"content": "Odli"}

event: token
data: {"content": "čno"}

event: token
data: {"content": "!"}

event: metadata
data: {"vocabulary_used": ["kruh"], "corrections": [...]}

event: done
data: {}
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│       VERCEL          │       │       RAILWAY         │
│  (Frontend Hosting)   │       │  (Backend Hosting)    │
├───────────────────────┤       ├───────────────────────┤
│                       │       │                       │
│  Next.js Application  │──────▶│  FastAPI Application  │
│                       │ HTTPS │                       │
│  - Static assets CDN  │       │  - Auto-scaling       │
│  - Edge functions     │       │  - Health checks      │
│  - Preview deployments│       │  - Log aggregation    │
│                       │       │                       │
└───────────────────────┘       └───────────┬───────────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        │                   │                   │
                        ▼                   ▼                   ▼
            ┌───────────────────┐ ┌─────────────────┐ ┌─────────────────┐
            │   NEON POSTGRES   │ │    LLM API      │ │   Blob Storage  │
            ├───────────────────┤ ├─────────────────┤ ├─────────────────┤
            │ - Serverless      │ │ - Claude 3.5    │ │ - Audio files   │
            │ - Auto-suspend    │ │ - Streaming     │ │ - User uploads  │
            │ - Branch DBs      │ │ - Structured    │ │                 │
            └───────────────────┘ └─────────────────┘ └─────────────────┘
```

### Environment Variables

**Frontend (.env.local):**

```bash
# API
NEXT_PUBLIC_API_URL=https://api.hrvatsk-ai.com

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/learn
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

**Backend (.env):**

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Clerk (for JWT verification)
CLERK_JWKS_URL=https://your-clerk-domain.clerk.accounts.dev/.well-known/jwks.json
CLERK_ISSUER=https://your-clerk-domain.clerk.accounts.dev

# LLM Provider (via LiteLLM)
LITELLM_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=sk-ant-...
# OR for OpenAI:
# LITELLM_MODEL=gpt-4-turbo
# OPENAI_API_KEY=sk-...
# OR for Gemini:
# LITELLM_MODEL=gemini-pro
# GOOGLE_API_KEY=...

# Server
CORS_ORIGINS=https://hrvatsk-ai.vercel.app
ENVIRONMENT=production
```

## Security Considerations

1. **Authentication**: Clerk handles auth, JWT verification in backend
2. **Rate Limiting**: Per-user limits on API calls
3. **Input Validation**: Pydantic models for all inputs
4. **CORS**: Strict origin allowlist
5. **API Key Security**: LLM API keys server-side only
6. **Clerk Security**: OAuth, MFA support, session management

## Cost Estimation

### LLM Costs (e.g. Claude 3.5 Sonnet)

| Operation       | Tokens (est.) | Cost/call | Calls/session | Cost/session |
| --------------- | ------------- | --------- | ------------- | ------------ |
| Lesson Plan     | ~2,000        | $0.006    | 1             | $0.006       |
| Tutor Response  | ~500          | $0.0015   | 10            | $0.015       |
| Quiz Generation | ~800          | $0.0024   | 1             | $0.0024      |
| **Total**       |               |           |               | **~$0.024**  |

At 100 sessions/month: ~$2.40/month LLM costs

### Infrastructure Costs

| Service | Free Tier Limits | Expected Use |
| ------- | ---------------- | ------------ |
| Vercel  | 100GB bandwidth  | Well within  |
| Railway | $5 credit/month  | Sufficient   |
| Neon    | 0.5GB storage    | Sufficient   |
| Clerk   | 10,000 MAU       | Well within  |

**Total MVP Cost**: ~$0-5/month (within free tiers)

## Future Enhancements

### Phase 2: Speech

- Add Whisper API for speech-to-text
- Add TTS for pronunciation practice
- Pronunciation grading

### Phase 3: Advanced Features

- Spaced repetition notifications
- Reading exercises with texts
- Writing exercises with detailed feedback
- Multi-user classroom mode

### Phase 4: Gamification

- Streaks and achievements
- Leaderboards
- Challenge mode

## Appendix: Croatian Language Considerations

### Grammatical Cases

Croatian has 7 cases that nouns, adjectives, and pronouns decline through:

| Case         | Question                        | Example (voda = water) |
| ------------ | ------------------------------- | ---------------------- |
| Nominative   | Tko/Što? (Who/What?)            | voda                   |
| Genitive     | Koga/Čega? (Of whom/what?)      | vode                   |
| Dative       | Komu/Čemu? (To whom/what?)      | vodi                   |
| Accusative   | Koga/Što? (Whom/What?)          | vodu                   |
| Vocative     | (Calling)                       | vodo!                  |
| Locative     | O komu/čemu? (About whom/what?) | vodi                   |
| Instrumental | S kim/čim? (With whom/what?)    | vodom                  |

### Verb Aspects

Croatian verbs come in pairs - imperfective (ongoing) and perfective (completed):

| Imperfective | Perfective | Meaning  |
| ------------ | ---------- | -------- |
| pisati       | napisati   | to write |
| čitati       | pročitati  | to read  |
| jesti        | pojesti    | to eat   |

### Teaching Sequence Recommendation

1. **A1**: Present tense, nominative/accusative, basic vocabulary
2. **A2**: Past tense, genitive, locative with prepositions
3. **B1**: Future tense, all cases, aspect pairs
4. **B2**: Conditional, subjunctive, idiomatic expressions

# Hrvatsk-AI API Contract

## Overview

This document defines the REST API contract between the Next.js frontend and FastAPI backend. All endpoints are prefixed with `/api/v1`.

## Base URL

- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://api.hrvatsk-ai.railway.app/api/v1`

## Authentication

**Authentication is handled by Clerk.** The frontend obtains JWT tokens from Clerk, which are passed to the backend for verification.

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <clerk_jwt_token>
```

### Clerk JWT Token Structure

Clerk JWTs contain:

```json
{
  "sub": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC", // Clerk user ID
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "exp": 1699999999,
  "iat": 1699900000,
  "iss": "https://your-app.clerk.accounts.dev",
  "azp": "your-frontend-url"
}
```

The `sub` claim is the `clerk_id` used to look up the user in our database.

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": { ... }
  }
}
```

### Error Codes

| Code               | HTTP Status | Description              |
| ------------------ | ----------- | ------------------------ |
| `VALIDATION_ERROR` | 400         | Invalid request data     |
| `UNAUTHORIZED`     | 401         | Missing or invalid token |
| `FORBIDDEN`        | 403         | Insufficient permissions |
| `NOT_FOUND`        | 404         | Resource not found       |
| `CONFLICT`         | 409         | Resource already exists  |
| `RATE_LIMITED`     | 429         | Too many requests        |
| `INTERNAL_ERROR`   | 500         | Server error             |

---

## Endpoints

### Users

> **Note**: Authentication (sign-up, sign-in, password reset, OAuth) is handled entirely by Clerk on the frontend. The backend only verifies Clerk JWT tokens.

#### GET /users/me

Get current user profile. Creates the user record if this is their first request (auto-provisioning from Clerk).

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "clerk_id": "user_2NNEqL2nrIRdJ194ndJqAHwEfxC",
    "email": "user@example.com",
    "name": "John Doe",
    "native_language": "en",
    "current_level": "A2",
    "onboarding_completed": true,
    "preferences": {
      "preferred_session_length": 15,
      "focus_areas": ["vocabulary", "grammar"],
      "difficulty_preference": "adaptive"
    },
    "stats": {
      "total_sessions": 12,
      "total_study_minutes": 180,
      "streak_days": 5,
      "vocabulary_known": 150,
      "vocabulary_mastered": 45
    },
    "created_at": "2024-01-01T10:00:00Z",
    "last_session_at": "2024-01-14T18:00:00Z"
  }
}
```

> **Note**: `email` and `name` are sourced from Clerk JWT claims. `clerk_id` is the unique identifier from Clerk (`sub` claim).

#### PATCH /users/me

Update user profile.

**Request:**

```json
{
  "name": "John Smith",
  "preferences": {
    "preferred_session_length": 20,
    "focus_areas": ["conversation"]
  }
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Smith",
    "preferences": {
      "preferred_session_length": 20,
      "focus_areas": ["conversation"],
      "difficulty_preference": "adaptive"
    },
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

#### GET /users/me/progress

Get detailed learning progress.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "overall": {
      "current_level": "A2",
      "level_progress_percentage": 65,
      "total_vocabulary": 150,
      "mastered_vocabulary": 45,
      "grammar_concepts_learned": 8,
      "total_study_hours": 3.5
    },
    "vocabulary_by_level": {
      "A1": {
        "total": 120,
        "mastered": 40,
        "practicing": 60,
        "introduced": 20
      },
      "A2": { "total": 30, "mastered": 5, "practicing": 15, "introduced": 10 }
    },
    "grammar_by_level": {
      "A1": { "total": 10, "mastered": 5, "practicing": 3, "introduced": 2 },
      "A2": { "total": 8, "mastered": 0, "practicing": 2, "introduced": 1 }
    },
    "weekly_activity": [
      { "date": "2024-01-08", "minutes": 15, "sessions": 1 },
      { "date": "2024-01-09", "minutes": 30, "sessions": 2 },
      { "date": "2024-01-10", "minutes": 0, "sessions": 0 },
      { "date": "2024-01-11", "minutes": 20, "sessions": 1 },
      { "date": "2024-01-12", "minutes": 15, "sessions": 1 },
      { "date": "2024-01-13", "minutes": 25, "sessions": 1 },
      { "date": "2024-01-14", "minutes": 30, "sessions": 2 }
    ],
    "streak": {
      "current": 5,
      "longest": 12
    },
    "recent_achievements": [
      {
        "type": "vocabulary_milestone",
        "title": "Word Collector",
        "description": "Learned 100 words",
        "achieved_at": "2024-01-12T10:00:00Z"
      }
    ]
  }
}
```

---

### Sessions

#### POST /sessions

Start a new learning session.

**Request:**

```json
{
  "time_allocation_minutes": 15,
  "focus_preference": "balanced"
}
```

`focus_preference` options: `"balanced"`, `"vocabulary"`, `"grammar"`, `"conversation"`

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "status": "planning",
      "time_allocation_minutes": 15,
      "started_at": "2024-01-15T10:30:00Z"
    },
    "message": "Preparing your lesson..."
  }
}
```

The frontend should then poll or use SSE to wait for the lesson plan.

#### GET /sessions/:id

Get session details including lesson plan.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "active",
    "time_allocation_minutes": 15,
    "started_at": "2024-01-15T10:30:00Z",
    "lesson_plan": {
      "objectives": [
        {
          "id": "obj-1",
          "description": "Practice basic greetings",
          "achieved": false
        },
        {
          "id": "obj-2",
          "description": "Learn 5 food vocabulary words",
          "achieved": false
        }
      ],
      "vocabulary_targets": [
        { "id": "vocab-1", "word": "kruh", "translation": "bread" },
        { "id": "vocab-2", "word": "voda", "translation": "water" }
      ],
      "grammar_focus": {
        "concept": "accusative_case_nouns",
        "focus_level": "introduce"
      },
      "scenario": "Ordering at a bakery"
    },
    "messages_count": 0,
    "elapsed_minutes": 0
  }
}
```

#### GET /sessions/:id/ready

Wait for session to be ready (lesson plan generated). Uses Server-Sent Events.

**Response (SSE Stream):**

```
event: status
data: {"status": "planning", "message": "Analyzing your learning history..."}

event: status
data: {"status": "planning", "message": "Creating personalized lesson plan..."}

event: ready
data: {"status": "active", "session_id": "660e8400-e29b-41d4-a716-446655440001"}
```

#### POST /sessions/:id/messages

Send a message in the session. Returns streaming response.

**Request:**

```json
{
  "content": "Dobar dan! Želim kruh."
}
```

**Response (SSE Stream):**

```
event: token
data: {"content": "Odli"}

event: token
data: {"content": "čno"}

event: token
data: {"content": "! "}

event: token
data: {"content": "Tvoja"}

... (more tokens)

event: metadata
data: {
  "vocabulary_used": ["kruh"],
  "corrections": [
    {
      "user_said": "Zelim",
      "should_be": "Želim",
      "explanation": "Don't forget the háček (ˇ) on ž"
    }
  ],
  "performance_signal": "on_track"
}

event: done
data: {}
```

#### GET /sessions/:id/messages

Get all messages in a session.

**Query Parameters:**

- `limit` (optional): Number of messages, default 50
- `before` (optional): Cursor for pagination

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg-1",
        "role": "assistant",
        "content": "Dobar dan! Danas ćemo vježbati naručivanje hrane. Zamislite da ste u pekari...",
        "created_at": "2024-01-15T10:30:05Z"
      },
      {
        "id": "msg-2",
        "role": "user",
        "content": "Dobar dan! Želim kruh.",
        "created_at": "2024-01-15T10:31:00Z"
      },
      {
        "id": "msg-3",
        "role": "assistant",
        "content": "Odlično! Tvoja rečenica je skoro savršena...",
        "corrections": [...],
        "created_at": "2024-01-15T10:31:02Z"
      }
    ],
    "has_more": false
  }
}
```

#### POST /sessions/:id/end

End the session and trigger quiz generation.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "quizzing",
    "quiz": {
      "questions": [
        {
          "id": 1,
          "type": "translate_to_croatian",
          "prompt": "How do you say 'bread' in Croatian?",
          "hint": "You ordered this at the bakery!"
        },
        {
          "id": 2,
          "type": "fill_blank",
          "prompt": "Želim ___. (I want water)",
          "grammar_note": "Accusative feminine: -a → -u"
        },
        {
          "id": 3,
          "type": "multiple_choice",
          "prompt": "Which is correct accusative of 'kava'?",
          "options": ["kava", "kavu", "kave", "kavom"]
        }
      ],
      "total_questions": 3
    }
  }
}
```

#### POST /sessions/:id/quiz/submit

Submit quiz answers.

**Request:**

```json
{
  "answers": [
    { "question_id": 1, "answer": "kruh" },
    { "question_id": 2, "answer": "vodu" },
    { "question_id": 3, "answer": "kavu" }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "status": "completed",
    "quiz_results": {
      "score": 3,
      "total": 3,
      "percentage": 100,
      "results": [
        {
          "question_id": 1,
          "correct": true,
          "user_answer": "kruh",
          "correct_answer": "kruh"
        },
        {
          "question_id": 2,
          "correct": true,
          "user_answer": "vodu",
          "correct_answer": "vodu"
        },
        {
          "question_id": 3,
          "correct": true,
          "user_answer": "kavu",
          "correct_answer": "kavu"
        }
      ]
    },
    "session_summary": {
      "duration_minutes": 12,
      "vocabulary_learned": 5,
      "vocabulary_practiced": 8,
      "grammar_concepts": ["accusative_case_nouns"],
      "objectives_achieved": 2,
      "objectives_total": 2,
      "xp_earned": 45
    }
  }
}
```

#### GET /sessions

Get user's session history.

**Query Parameters:**

- `limit` (optional): Number of sessions, default 10
- `offset` (optional): Pagination offset

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "status": "completed",
        "started_at": "2024-01-15T10:30:00Z",
        "ended_at": "2024-01-15T10:42:00Z",
        "duration_minutes": 12,
        "quiz_score": 100,
        "vocabulary_count": 5
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "status": "completed",
        "started_at": "2024-01-14T18:00:00Z",
        "ended_at": "2024-01-14T18:15:00Z",
        "duration_minutes": 15,
        "quiz_score": 80,
        "vocabulary_count": 8
      }
    ],
    "total": 12,
    "has_more": true
  }
}
```

---

### Vocabulary

#### GET /vocabulary

Get vocabulary items with filtering.

**Query Parameters:**

- `level` (optional): CEFR level (A1, A2, B1, etc.)
- `category` (optional): Semantic category (food, travel, etc.)
- `part_of_speech` (optional): noun, verb, adjective, etc.
- `search` (optional): Search term
- `limit` (optional): Default 50
- `offset` (optional): Pagination

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "vocab-1",
        "croatian": "kruh",
        "english": "bread",
        "part_of_speech": "noun",
        "gender": "masculine",
        "cefr_level": "A1",
        "category": "food",
        "example": {
          "croatian": "Kupujem svježi kruh.",
          "english": "I am buying fresh bread."
        },
        "user_progress": {
          "mastery_level": 3,
          "exposure_count": 5,
          "last_seen": "2024-01-15T10:30:00Z"
        }
      }
    ],
    "total": 120,
    "has_more": true
  }
}
```

#### GET /vocabulary/:id

Get detailed vocabulary item with all forms.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "vocab-1",
    "croatian": "voda",
    "english": "water",
    "part_of_speech": "noun",
    "gender": "feminine",
    "cefr_level": "A1",
    "category": "food",
    "case_forms": {
      "singular": {
        "nominative": "voda",
        "genitive": "vode",
        "dative": "vodi",
        "accusative": "vodu",
        "vocative": "vodo",
        "locative": "vodi",
        "instrumental": "vodom"
      },
      "plural": {
        "nominative": "vode",
        "genitive": "voda",
        "dative": "vodama",
        "accusative": "vode",
        "vocative": "vode",
        "locative": "vodama",
        "instrumental": "vodama"
      }
    },
    "examples": [
      {
        "croatian": "Pijem hladnu vodu.",
        "english": "I am drinking cold water."
      }
    ],
    "pronunciation_guide": "VOH-dah",
    "audio_url": "https://storage.example.com/audio/voda.mp3",
    "user_progress": {
      "mastery_level": 4,
      "exposure_count": 12,
      "correct_count": 10,
      "srs_due_date": "2024-01-18T00:00:00Z",
      "first_learned": "2024-01-05T10:00:00Z"
    }
  }
}
```

#### GET /vocabulary/review

Get vocabulary items due for spaced repetition review.

**Query Parameters:**

- `limit` (optional): Max items, default 20

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "vocab-1",
        "croatian": "voda",
        "english": "water",
        "part_of_speech": "noun",
        "mastery_level": 3,
        "last_seen": "2024-01-12T10:00:00Z",
        "days_overdue": 1
      }
    ],
    "total_due": 15,
    "returned": 15
  }
}
```

#### POST /vocabulary/:id/practice

Record a practice attempt for vocabulary item.

**Request:**

```json
{
  "correct": true,
  "context": "session",
  "session_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "vocabulary_id": "vocab-1",
    "new_mastery_level": 4,
    "new_srs_due_date": "2024-01-22T00:00:00Z",
    "streak_bonus": false
  }
}
```

---

### Grammar

#### GET /grammar

Get grammar concepts.

**Query Parameters:**

- `level` (optional): CEFR level
- `category` (optional): cases, verbs, etc.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "concepts": [
      {
        "id": "grammar-1",
        "name": "Accusative Case (Nouns)",
        "slug": "accusative_case_nouns",
        "cefr_level": "A1",
        "category": "cases",
        "description": "The accusative case is used for direct objects...",
        "user_progress": {
          "mastery_level": 2,
          "practice_count": 8
        }
      }
    ]
  }
}
```

#### GET /grammar/:slug

Get detailed grammar concept.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "grammar-1",
    "name": "Accusative Case (Nouns)",
    "slug": "accusative_case_nouns",
    "cefr_level": "A1",
    "category": "cases",
    "description": "The accusative case is used for direct objects...",
    "explanation": "In Croatian, when a noun is the direct object of a verb...",
    "examples": {
      "basic": [
        {
          "croatian": "Vidim kuću.",
          "english": "I see a house.",
          "highlight": "kuću",
          "note": "kuća → kuću"
        }
      ],
      "intermediate": [...]
    },
    "common_mistakes": [
      {
        "mistake": "Using nominative after transitive verbs",
        "wrong": "Vidim kuća",
        "correct": "Vidim kuću"
      }
    ],
    "practice_sentences": [
      {
        "prompt": "Complete: Čitam ___. (I read the book)",
        "answer": "knjigu",
        "source": "knjiga"
      }
    ],
    "prerequisites": [],
    "user_progress": {
      "mastery_level": 2,
      "practice_count": 8,
      "correct_count": 6,
      "introduced_at": "2024-01-10T10:00:00Z"
    }
  }
}
```

---

### Health and Utility

#### GET /health

Health check endpoint.

**Response (200 OK):**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET /stats

Public statistics (no auth required).

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_sessions": 1250,
    "total_vocabulary_items": 2500,
    "supported_levels": ["A1", "A2", "B1"]
  }
}
```

---

## WebSocket Events (Future)

For real-time features, we may add WebSocket support:

```
ws://api.hrvatsk-ai.railway.app/ws

Events:
- session.started
- session.message
- session.ended
- user.streak_updated
- user.level_up
```

---

## Rate Limiting

| Endpoint Group   | Limit      |
| ---------------- | ---------- |
| Session creation | 5/hour     |
| Message sending  | 60/minute  |
| General API      | 100/minute |

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

---

## CORS Configuration

Allowed origins:

- `https://hrvatsk-ai.vercel.app`
- `http://localhost:3000` (development)

Allowed methods: `GET, POST, PATCH, DELETE, OPTIONS`

Allowed headers: `Authorization, Content-Type`

---

## Versioning

API versioning is done via URL path: `/api/v1/...`

Breaking changes will be released as `/api/v2/...` with a deprecation period for v1.

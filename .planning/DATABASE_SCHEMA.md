# Hrvatsk-AI Database Schema

## Overview

This document defines the PostgreSQL database schema for Hrvatsk-AI. The schema is designed to support:

- User profile and learning preferences (authentication handled by Clerk)
- Vocabulary tracking with Croatian-specific features (cases, aspects)
- Session management with lesson plans
- Spaced repetition scheduling
- Grammar concept progression

**Note**: User authentication (email, password, sessions, OAuth) is handled by Clerk. Our database only stores learning-specific user data, linked via `clerk_id`.

## Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
│                     (Auth handled by Clerk externally)                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────┐          ┌──────────────────────┐
  │    users     │          │   vocabulary_items   │
  │──────────────│          │──────────────────────│
  │ id (PK)      │          │ id (PK)              │
  │ clerk_id (U) │          │ croatian             │
  │ native_lang  │          │ english              │
  │ current_level│          │ part_of_speech       │
  │ onboard_done │          │ gender               │
  │ preferences  │          │ case_forms           │
  │ created_at   │          │ aspect_pair_id (FK)  │──┐ (self-reference)
  │ updated_at   │          │ cefr_level           │◀─┘
  └──────┬───────┘          │ frequency_rank       │
         │                  │ audio_url            │
         │                  │ notes                │
         │                  └──────────┬───────────┘
         │                             │
         │         ┌───────────────────┤
         │         │                   │
         ▼         ▼                   │
  ┌────────────────────────┐           │
  │    user_vocabulary     │           │
  │────────────────────────│           │
  │ id (PK)                │           │
  │ user_id (FK)           │───────────│
  │ vocabulary_item_id (FK)│◀──────────┘
  │ exposure_count         │
  │ correct_count          │
  │ mastery_level          │
  │ last_seen              │
  │ srs_due_date           │
  │ srs_interval_days      │
  │ created_at             │
  └────────────────────────┘

         │
         │
         ▼
  ┌────────────────────────┐       ┌────────────────────────┐
  │       sessions         │       │        messages        │
  │────────────────────────│       │────────────────────────│
  │ id (PK)                │       │ id (PK)                │
  │ user_id (FK)           │◀──────│ session_id (FK)        │
  │ status                 │       │ role                   │
  │ started_at             │       │ content                │
  │ ended_at               │       │ corrections            │
  │ time_allocation_mins   │       │ vocabulary_used        │
  │ lesson_plan            │       │ grammar_concepts_used  │
  │ performance_metrics    │       │ created_at             │
  │ quiz_results           │       └────────────────────────┘
  │ objectives_achieved    │
  │ created_at             │
  └────────────────────────┘

  ┌────────────────────────┐       ┌────────────────────────┐
  │   grammar_concepts     │       │  user_grammar_progress │
  │────────────────────────│       │────────────────────────│
  │ id (PK)                │◀──────│ grammar_concept_id (FK)│
  │ name                   │       │ user_id (FK)           │
  │ slug                   │       │ introduced_at          │
  │ cefr_level             │       │ practice_count         │
  │ category               │       │ correct_count          │
  │ description            │       │ mastery_level          │
  │ explanation            │       │ last_practiced         │
  │ examples               │       │ created_at             │
  │ prerequisites          │       └────────────────────────┘
  │ sort_order             │
  │ created_at             │
  └────────────────────────┘
```

## Tables

### users

Stores user learning profiles and preferences. Authentication is handled by Clerk - we only store the `clerk_id` to link to Clerk's user management.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,  -- Links to Clerk user
    native_language VARCHAR(10) DEFAULT 'en',
    current_level VARCHAR(10) DEFAULT 'A1' CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    total_sessions INTEGER DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_session_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- clerk_id is the primary lookup for authenticated users
CREATE UNIQUE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_last_session ON users(last_session_at);
```

**Note on Clerk Integration:**

- `clerk_id` is the `sub` claim from the Clerk JWT token
- User email, name, and profile picture are fetched from Clerk when needed
- No passwords or OAuth tokens are stored in our database

**Preferences JSONB Structure:**

```json
{
  "preferred_session_length": 15,
  "focus_areas": ["vocabulary", "grammar", "conversation"],
  "difficulty_preference": "adaptive",
  "notification_enabled": true,
  "voice_enabled": false,
  "ui_theme": "light"
}
```

### vocabulary_items

Master vocabulary list with Croatian-specific linguistic data.

```sql
CREATE TABLE vocabulary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    croatian VARCHAR(100) NOT NULL,
    english VARCHAR(200) NOT NULL,
    part_of_speech VARCHAR(20) NOT NULL CHECK (part_of_speech IN (
        'noun', 'verb', 'adjective', 'adverb', 'pronoun',
        'preposition', 'conjunction', 'interjection', 'numeral', 'particle'
    )),
    gender VARCHAR(10) CHECK (gender IN ('masculine', 'feminine', 'neuter', NULL)),
    case_forms JSONB,  -- Noun/adjective declensions
    verb_forms JSONB,  -- Verb conjugations
    aspect VARCHAR(15) CHECK (aspect IN ('imperfective', 'perfective', NULL)),
    aspect_pair_id UUID REFERENCES vocabulary_items(id),  -- Links perfective/imperfective pairs
    cefr_level VARCHAR(10) DEFAULT 'A1' CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    frequency_rank INTEGER,  -- Lower = more common
    category VARCHAR(50),  -- Semantic category: food, travel, body, etc.
    example_sentence_hr VARCHAR(500),
    example_sentence_en VARCHAR(500),
    pronunciation_guide VARCHAR(200),
    audio_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vocabulary_croatian ON vocabulary_items(croatian);
CREATE INDEX idx_vocabulary_level ON vocabulary_items(cefr_level);
CREATE INDEX idx_vocabulary_pos ON vocabulary_items(part_of_speech);
CREATE INDEX idx_vocabulary_category ON vocabulary_items(category);
CREATE INDEX idx_vocabulary_frequency ON vocabulary_items(frequency_rank);
```

**case_forms JSONB Structure (for nouns):**

```json
{
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
}
```

**verb_forms JSONB Structure:**

```json
{
  "infinitive": "pisati",
  "present": {
    "1sg": "pišem",
    "2sg": "pišeš",
    "3sg": "piše",
    "1pl": "pišemo",
    "2pl": "pišete",
    "3pl": "pišu"
  },
  "past": {
    "masculine_sg": "pisao",
    "feminine_sg": "pisala",
    "neuter_sg": "pisalo",
    "masculine_pl": "pisali",
    "feminine_pl": "pisale",
    "neuter_pl": "pisala"
  },
  "imperative": {
    "2sg": "piši",
    "1pl": "pišimo",
    "2pl": "pišite"
  }
}
```

### user_vocabulary

Tracks individual user's vocabulary knowledge and spaced repetition state.

```sql
CREATE TABLE user_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_item_id UUID NOT NULL REFERENCES vocabulary_items(id) ON DELETE CASCADE,
    exposure_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
    last_seen TIMESTAMPTZ,
    last_correct TIMESTAMPTZ,
    last_incorrect TIMESTAMPTZ,
    -- Spaced Repetition Fields
    srs_due_date TIMESTAMPTZ,
    srs_interval_days REAL DEFAULT 1.0,
    srs_ease_factor REAL DEFAULT 2.5,
    srs_repetitions INTEGER DEFAULT 0,
    -- Context tracking
    first_learned_in_session UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, vocabulary_item_id)
);

CREATE INDEX idx_user_vocab_user ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocab_mastery ON user_vocabulary(user_id, mastery_level);
CREATE INDEX idx_user_vocab_srs_due ON user_vocabulary(user_id, srs_due_date);
CREATE INDEX idx_user_vocab_last_seen ON user_vocabulary(user_id, last_seen);
```

**Mastery Level Definitions:**
| Level | Name | Description |
|-------|------|-------------|
| 0 | Unknown | Never encountered |
| 1 | Introduced | Seen 1-2 times |
| 2 | Familiar | Recognizes, may not recall |
| 3 | Practiced | Can use with effort |
| 4 | Confident | Uses correctly most times |
| 5 | Mastered | Uses automatically |

### sessions

Stores learning session data including lesson plans and outcomes.

```sql
CREATE TYPE session_status AS ENUM ('created', 'planning', 'active', 'quizzing', 'completed', 'abandoned');

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status session_status DEFAULT 'created',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    time_allocation_minutes INTEGER NOT NULL CHECK (time_allocation_minutes > 0),
    actual_duration_minutes INTEGER,
    -- Lesson Planning
    lesson_plan JSONB,
    lesson_plan_generated_at TIMESTAMPTZ,
    -- Performance Tracking
    performance_metrics JSONB DEFAULT '{}',
    adaptations_made JSONB DEFAULT '[]',
    -- Session Outcomes
    vocabulary_introduced UUID[] DEFAULT '{}',
    vocabulary_practiced UUID[] DEFAULT '{}',
    grammar_concepts_covered UUID[] DEFAULT '{}',
    objectives_achieved JSONB DEFAULT '[]',
    -- Quiz
    quiz_questions JSONB,
    quiz_results JSONB,
    quiz_score REAL,
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_status ON sessions(status);
```

**lesson_plan JSONB Structure:**

```json
{
  "session_duration_minutes": 15,
  "level": "A1",
  "objectives": [
    {
      "id": "obj-1",
      "description": "Practice basic greetings",
      "priority": 1,
      "achieved": false
    }
  ],
  "vocabulary_targets": [
    {
      "id": "vocab-uuid",
      "word": "kruh",
      "focus": "accusative form",
      "priority": 1
    }
  ],
  "grammar_focus": {
    "concept_id": "grammar-uuid",
    "concept_name": "accusative_case_nouns",
    "level": "introduce",
    "examples": ["Želim kruh.", "Vidim vodu."]
  },
  "conversation_scenario": {
    "setting": "Ordering at a bakery",
    "student_role": "Customer",
    "tutor_role": "Shopkeeper",
    "key_phrases": ["Dobar dan!", "Želim...", "Koliko košta?"]
  },
  "success_criteria": [
    "User correctly uses 3+ target vocabulary words",
    "User attempts accusative case in 2+ sentences"
  ]
}
```

**performance_metrics JSONB Structure:**

```json
{
  "total_exchanges": 12,
  "vocabulary_correct_rate": 0.75,
  "grammar_correct_rate": 0.6,
  "average_response_time_seconds": 25,
  "response_length_trend": "stable",
  "engagement_score": 0.85,
  "struggles": ["accusative_feminine"],
  "strengths": ["greeting_phrases"]
}
```

**quiz_results JSONB Structure:**

```json
{
  "total_questions": 5,
  "correct_answers": 4,
  "score_percentage": 80,
  "time_taken_seconds": 120,
  "answers": [
    {
      "question_id": 1,
      "user_answer": "kruh",
      "correct_answer": "kruh",
      "is_correct": true,
      "time_seconds": 15
    }
  ]
}
```

### messages

Stores individual messages within sessions for context and analytics.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    -- Analysis
    corrections JSONB DEFAULT '[]',
    vocabulary_used UUID[] DEFAULT '{}',
    grammar_concepts_used UUID[] DEFAULT '{}',
    -- Performance signals
    detected_errors JSONB DEFAULT '[]',
    performance_signal VARCHAR(20) CHECK (performance_signal IN ('struggling', 'on_track', 'excelling', NULL)),
    adaptation_triggered BOOLEAN DEFAULT FALSE,
    -- Timing
    response_time_ms INTEGER,
    token_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_session_order ON messages(session_id, created_at);
```

**corrections JSONB Structure:**

```json
[
  {
    "user_said": "Zelim voda",
    "should_be": "Želim vodu",
    "error_types": ["missing_diacritic", "case_error"],
    "explanation": "Use accusative case after 'želim' (voda → vodu), and don't forget the háček on ž",
    "severity": "minor"
  }
]
```

**detected_errors JSONB Structure:**

```json
[
  {
    "type": "case_error",
    "expected": "accusative",
    "received": "nominative",
    "word": "voda",
    "context": "after 'želim'"
  }
]
```

### grammar_concepts

Master list of grammar concepts with teaching materials.

```sql
CREATE TABLE grammar_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    cefr_level VARCHAR(10) NOT NULL CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    category VARCHAR(50) NOT NULL,  -- 'cases', 'verbs', 'word_order', etc.
    description TEXT NOT NULL,
    explanation TEXT NOT NULL,  -- Full teaching explanation
    examples JSONB NOT NULL,
    common_mistakes JSONB DEFAULT '[]',
    practice_triggers JSONB DEFAULT '[]',  -- When to practice this
    prerequisites UUID[] DEFAULT '{}',  -- Other concepts that should be learned first
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grammar_level ON grammar_concepts(cefr_level);
CREATE INDEX idx_grammar_category ON grammar_concepts(category);
CREATE INDEX idx_grammar_slug ON grammar_concepts(slug);
```

**examples JSONB Structure:**

```json
{
  "basic": [
    {
      "croatian": "Vidim kuću.",
      "english": "I see a house.",
      "highlight": "kuću",
      "note": "kuća (nom.) → kuću (acc.)"
    }
  ],
  "intermediate": [
    {
      "croatian": "Čitam zanimljivu knjigu.",
      "english": "I am reading an interesting book.",
      "highlight": "zanimljivu knjigu",
      "note": "Both adjective and noun in accusative"
    }
  ]
}
```

**common_mistakes JSONB Structure:**

```json
[
  {
    "mistake": "Using nominative after 'imam'",
    "example_wrong": "Imam sestra",
    "example_correct": "Imam sestru",
    "explanation": "Direct objects take accusative case"
  }
]
```

### user_grammar_progress

Tracks individual user's grammar concept mastery.

```sql
CREATE TABLE user_grammar_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    grammar_concept_id UUID NOT NULL REFERENCES grammar_concepts(id) ON DELETE CASCADE,
    introduced_at TIMESTAMPTZ,
    practice_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
    last_practiced TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, grammar_concept_id)
);

CREATE INDEX idx_user_grammar_user ON user_grammar_progress(user_id);
CREATE INDEX idx_user_grammar_mastery ON user_grammar_progress(user_id, mastery_level);
```

## Seed Data Requirements

### Essential Vocabulary

The initial vocabulary should cover:

1. **A1 Core Vocabulary (~500 words)**

   - Greetings and basic phrases (20)
   - Numbers 1-100 (20)
   - Days, months, time (30)
   - Family members (15)
   - Food and drink (50)
   - Common verbs (50)
   - Basic adjectives (40)
   - Body parts (25)
   - Colors (12)
   - Clothing (20)
   - House and furniture (30)
   - Transportation (15)
   - Weather (15)
   - Professions (20)
   - Common nouns (150+)

2. **A2 Extension (~500 additional words)**
3. **B1 Extension (~1000 additional words)**

### Essential Grammar Concepts

**A1 Grammar Concepts:**

```
- present_tense_regular
- present_tense_irregular_common
- nominative_case
- accusative_case_basic
- gender_nouns
- adjective_agreement_basic
- personal_pronouns_nominative
- question_words
- negation_basic
- word_order_basic
```

**A2 Grammar Concepts:**

```
- past_tense_basic
- genitive_case
- dative_case
- locative_case
- prepositions_with_cases
- possessive_pronouns
- reflexive_verbs
- comparative_adjectives
- modal_verbs
```

## Migration Strategy

Migrations will be managed with Alembic. The migration sequence:

1. `001_initial_schema.sql` - All tables and indexes
2. `002_seed_grammar_concepts.sql` - Core grammar concepts
3. `003_seed_vocabulary_a1.sql` - A1 vocabulary items
4. `004_seed_vocabulary_a2.sql` - A2 vocabulary items

## Performance Considerations

### Indexes

Critical indexes for performance:

- `user_vocabulary(user_id, srs_due_date)` - SRS queries
- `sessions(user_id, started_at)` - User history
- `messages(session_id, created_at)` - Conversation retrieval
- `vocabulary_items(cefr_level, frequency_rank)` - Level-appropriate word selection

### Query Patterns

Common queries and their expected performance:

| Query                      | Expected Rows | Index Used                 |
| -------------------------- | ------------- | -------------------------- |
| Get user's due vocabulary  | 10-50         | idx_user_vocab_srs_due     |
| Get session messages       | 10-30         | idx_messages_session_order |
| Get vocabulary by level    | 100-500       | idx_vocabulary_level       |
| Get user's recent sessions | 5-20          | idx_sessions_user_date     |

### Connection Pooling

With Neon's serverless PostgreSQL:

- Use connection pooling (PgBouncer)
- Set pool size based on Railway container memory
- Recommended: 10-20 connections for MVP

## Backup and Recovery

### Neon Features

- Automatic point-in-time recovery
- Branch databases for testing
- Automatic backups included in free tier

### Data Export

Implement periodic export of:

- User progress data
- Session analytics
- Vocabulary usage statistics

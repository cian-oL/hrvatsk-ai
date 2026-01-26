"""
FastAPI application entry point.

Run with:
    uv run uvicorn hrvatsk_ai_api.main:app --reload
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from hrvatsk_ai_api.api.routes import health, sessions
from hrvatsk_ai_api.config import settings
from hrvatsk_ai_api.infrastructure.database import dispose_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    App lifespan handler for startup and shutdown events.

    Args:
        app (FastAPI): The FastAPI application.

    Returns:
        AsyncIterator[None]: Async iterator for context management of app.
    """
    await init_db()

    try:
        yield
    finally:
        await dispose_db()


app = FastAPI(
    title="Hrvatsk-AI API",
    description="Croatian language learning API",
    version="0.1.0",
    lifespan=lifespan,
)

origins = [settings.frontend_base_url]

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health.router, prefix="/api/v1")
app.include_router(sessions.router, prefix="/api/v1")

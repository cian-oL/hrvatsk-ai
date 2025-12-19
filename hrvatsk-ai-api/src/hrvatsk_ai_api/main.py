"""
FastAPI application entry point.

Run with:
    uv run uvicorn hrvatsk_ai_api.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from hrvatsk_ai_api.api.routes import health, sessions
from hrvatsk_ai_api.config import settings

app = FastAPI(
    title="Hrvatsk-AI API",
    description="Croatian language learning API",
    version="0.1.0",
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

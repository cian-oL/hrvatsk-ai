"""
Health check endpoint.
"""

from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """
    Health check endpoint.
    """

    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

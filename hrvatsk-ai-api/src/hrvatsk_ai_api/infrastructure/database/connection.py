"""
Database session management with async SQLAlchemy.
"""

from collections.abc import AsyncGenerator
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from hrvatsk_ai_api.config import settings

# Convert postgresql:// to postgresql+asyncpg://
_database_url = settings.database_url
if _database_url.startswith("postgresql://"):
    _database_url = _database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove SSL-related params - asyncpg handles SSL via connect_args
_parsed = urlparse(_database_url)
_params = parse_qs(_parsed.query)
_params.pop("sslmode", None)
_params.pop("channel_binding", None)
_new_query = urlencode(_params, doseq=True)
_database_url = urlunparse(_parsed._replace(query=_new_query))

engine = create_async_engine(
    _database_url,
    echo=False,
    pool_pre_ping=True,
    connect_args={"ssl": True},
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides an async database session.
    """

    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """
    Initialize database connection (for startup checks).
    """

    async with engine.begin() as conn:
        await conn.run_sync(lambda _: None)

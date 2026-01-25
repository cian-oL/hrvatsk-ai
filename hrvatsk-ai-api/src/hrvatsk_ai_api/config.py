"""
Application configuration using pydantic-settings.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_env_file = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=_env_file,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM Configuration
    openai_api_key: str
    llm_model: str = "groq/llama-3.3-70b-versatile"

    # Frontend origin
    frontend_base_url: str

    # Database
    database_url: str


settings = Settings()

"""
Configuración centralizada con Pydantic Settings.
Lee variables de entorno / .env sin hardcodear secretos.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = (
        "postgresql://promohunt:promohunt@localhost:5432/descuentos_juegos"
    )
    TEST_DATABASE_URL: str = (
        "postgresql://promohunt:promohunt@localhost:5433/descuentos_juegos_test"
    )

    SECRET_KEY: str = "cambia-esto-por-una-clave-aleatoria-de-al-menos-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"

    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_FROM: str = "noreply@promohunt.local"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

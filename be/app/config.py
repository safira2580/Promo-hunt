"""
Configuración centralizada con Pydantic Settings.
Lee variables de entorno / .env sin hardcodear secretos.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_SECRET = "cambia-esto-por-una-clave-aleatoria-de-al-menos-32-chars"


def normalize_db_url(url: str) -> str:
    """Fuerza el driver psycopg2 (SQLAlchemy 2.1 usa psycopg v3 por defecto)
    y acepta URLs `postgres://` como las que entregan Render/Heroku."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        url = "postgresql+psycopg2://" + url[len("postgresql://") :]
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DATABASE_URL: str = "postgresql://promohunt:promohunt@localhost:5432/descuentos_juegos"
    TEST_DATABASE_URL: str = (
        "postgresql://promohunt:promohunt@localhost:5433/descuentos_juegos_test"
    )

    SECRET_KEY: str = DEFAULT_SECRET
    ALGORITHM: str = "HS256"
    BCRYPT_ROUNDS: int = 12
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173"

    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 1025
    SMTP_FROM: str = "noreply@promohunt.local"

    def validate_for_production(self) -> None:
        if self.ENVIRONMENT == "production" and (
            self.SECRET_KEY == DEFAULT_SECRET or len(self.SECRET_KEY) < 32
        ):
            raise RuntimeError(
                "SECRET_KEY insegura en producción: define una clave aleatoria de "
                "al menos 32 caracteres (python3 -c 'import secrets;print(secrets.token_hex(32))')"
            )

    @property
    def database_url_sync(self) -> str:
        return normalize_db_url(self.DATABASE_URL)

    @property
    def test_database_url_sync(self) -> str:
        return normalize_db_url(self.TEST_DATABASE_URL)

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

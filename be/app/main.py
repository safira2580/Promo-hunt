"""
Punto de entrada FastAPI — PromoHunt API.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy import text

from app.config import get_settings
from app.database import engine
from app.errors import register_error_handlers
from app.routers import admin, auth, games, users

settings = get_settings()
settings.validate_for_production()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("✅ PromoHunt API iniciando...")
    yield
    print("🛑 PromoHunt API cerrando...")


app = FastAPI(
    title="PromoHunt API",
    description="Descuentos y ofertas en videojuegos — FastAPI + PostgreSQL",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(auth.router)
app.include_router(games.router)
app.include_router(users.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"mensaje": "Backend de PromoHunt funcionando (FastAPI)", "docs": "/docs"}


@app.get("/health")
def health():
    """Liveness: el proceso responde (no toca la BD; ideal para balanceadores)."""
    return {"status": "ok"}


@app.get("/health/ready")
def ready():
    """Readiness: además verifica la conexión a PostgreSQL."""
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    return {"status": "ready"}

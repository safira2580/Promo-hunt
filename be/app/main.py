"""
Punto de entrada FastAPI — PromoHunt API.
"""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
import os

# Asegurar carpeta estática
os.makedirs("static/img", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

from app.config import get_settings
from app.database import get_db
from app.errors import register_error_handlers
from app.routers import admin, auth, extras, games, users

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
orígenes_permitidos = [
    "https://promo-hunt-production.up.railway.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=orígenes_permitidos,  # Reemplazamos temporalmente para asegurar que entre
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(auth.router)
app.include_router(games.router)
app.include_router(users.router)
app.include_router(extras.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"mensaje": "Backend de PromoHunt funcionando (FastAPI)", "docs": "/docs"}


@app.get("/health")
def health():
    """Liveness: el proceso responde (no toca la BD; ideal para balanceadores)."""
    return {"status": "ok"}


@app.get("/health/ready")
def ready(db: Session = Depends(get_db)):
    """Readiness: además verifica la conexión a PostgreSQL (usa la sesión inyectada)."""
    db.execute(text("SELECT 1"))
    return {"status": "ready"}

"""
Punto de entrada FastAPI — PromoHunt API.
"""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.errors import register_error_handlers
from app.routers import admin, auth, extras, games, users

logger = logging.getLogger("promohunt")

# Definir directorio estático seguro apuntando al Volumen de Railway en producción (/app/static)
if os.environ.get("ENVIRONMENT") == "production":
    STATIC_DIR = "/app/static/img"
    STATIC_MOUNT_DIR = "/app/static"
else:
    STATIC_DIR = "static/img"
    STATIC_MOUNT_DIR = "static"

try:
    os.makedirs(STATIC_DIR, exist_ok=True)
except Exception as exc:
    logger.warning("No se pudo crear la carpeta estática %s: %s", STATIC_DIR, exc)

settings = get_settings()
settings.validate_for_production()


def _obtener_origenes_permitidos() -> list[str]:
    """Combina orígenes por defecto con variables de entorno opcionales en Railway."""
    origenes_base = [
        "https://promo-hunt-production.up.railway.app",
        "https://lucky-unity-production-fb8a.up.railway.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    extra_raw = os.environ.get("CORS_ORIGINS") or os.environ.get("FRONTEND_URL") or ""
    extras_limpios = [
        origen.strip().rstrip("/") for origen in extra_raw.split(",") if origen.strip()
    ]

    # Evita duplicados conservando el orden
    resultado: list[str] = []
    for origen in [*origenes_base, *extras_limpios]:
        normalizado = origen.rstrip("/")
        if normalizado and normalizado not in resultado:
            resultado.append(normalizado)
    return resultado


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("PromoHunt API iniciando...")
    yield
    logger.info("PromoHunt API cerrando...")


app = FastAPI(
    title="PromoHunt API",
    description="Descuentos y ofertas en videojuegos — FastAPI + PostgreSQL",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan,
)

# Montaje seguro de archivos estáticos si la carpeta está disponible en el volumen
try:
    if os.path.exists(STATIC_MOUNT_DIR):
        app.mount("/static", StaticFiles(directory=STATIC_MOUNT_DIR), name="static")
except Exception as exc:
    logger.warning("No se pudo montar /static desde %s: %s", STATIC_MOUNT_DIR, exc)

# Registrar manejadores de error antes de envolver con middlewares externos
register_error_handlers(app)

app.include_router(auth.router)
app.include_router(games.router)
app.include_router(users.router)
app.include_router(extras.router)
app.include_router(admin.router)

# En Starlette/FastAPI, el último middleware agregado envuelve más por fuera
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_obtener_origenes_permitidos(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"mensaje": "Backend de PromoHunt funcionando (FastAPI)", "docs": "/docs"}


@app.get("/health")
def health():
    """Liveness: el proceso responde (no toca la BD)."""
    return {"status": "ok"}


@app.get("/health/ready")
def ready(db: Session = Depends(get_db)):
    """Readiness: verifica que la conexión con PostgreSQL esté activa."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as exc:
        logger.error("Fallo en /health/ready al consultar PostgreSQL: %s", exc)
        raise HTTPException(status_code=503, detail="Base de datos no disponible") from exc

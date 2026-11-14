"""
Punto de entrada FastAPI - PromoHunt API.
"""

import asyncio
import contextlib
import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.errors import register_error_handlers
from app.routers import admin, auth, games, users

settings = get_settings()
settings.validate_for_production()

logger = logging.getLogger("promohunt")

# Cada cuantos segundos se revisan los descuentos cuya fecha de fin ya paso
INTERVALO_EXPIRACION_SEG = 60


def expirar_descuentos() -> int:
    """
    Pasa a 'Inactivo' los descuentos activos cuya fecha de fin ya termino.

    La fecha de fin se toma como el ultimo dia de vigencia: el descuento sigue
    activo durante todo ese dia y se desactiva al comenzar el siguiente
    (hora de Colombia). Es idempotente, asi que puede ejecutarse varias veces.
    """
    generador = get_db()
    db = next(generador)
    try:
        resultado = db.execute(
            text(
                """
                UPDATE descuento
                SET estado = 'Inactivo'
                WHERE estado = 'Activo'
                  AND fecha_fin IS NOT NULL
                  AND fecha_fin::date < (NOW() AT TIME ZONE 'America/Bogota')::date
                """
            )
        )
        db.commit()
        return resultado.rowcount or 0
    except Exception:
        db.rollback()
        logger.exception("No se pudieron expirar los descuentos vencidos")
        return 0
    finally:
        generador.close()


async def _vigilar_descuentos() -> None:
    while True:
        try:
            cantidad = await asyncio.to_thread(expirar_descuentos)
            if cantidad:
                logger.info("Descuentos desactivados por fecha de fin: %s", cantidad)
        except Exception:
            logger.exception("Error en la revision de descuentos")
        await asyncio.sleep(INTERVALO_EXPIRACION_SEG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\u2705 PromoHunt API iniciando...")
    tarea = asyncio.create_task(_vigilar_descuentos())
    yield
    tarea.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await tarea
    print("\U0001F6D1 PromoHunt API cerrando...")


app = FastAPI(
    title="PromoHunt API",
    description="Descuentos y ofertas en videojuegos \u2014 FastAPI + PostgreSQL",
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
def ready(db: Session = Depends(get_db)):
    """Readiness: ademas verifica la conexion a PostgreSQL (usa la sesion inyectada)."""
    db.execute(text("SELECT 1"))
    return {"status": "ready"}

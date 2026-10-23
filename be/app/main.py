"""
Punto de entrada FastAPI — PromoHunt API.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, games

settings = get_settings()


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(games.router)


@app.get("/")
def root():
    return {"mensaje": "Backend de PromoHunt funcionando (FastAPI)", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}

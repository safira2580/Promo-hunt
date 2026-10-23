from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import game_service

router = APIRouter(prefix="/api/v1", tags=["games"])


@router.get("/juegos")
def obtener_juegos(
    categoria: int | None = Query(None, description="Filtrar por id_categoria"),
    db: Session = Depends(get_db),
):
    """Lista juegos con descuentos activos (compatible con el frontend actual)."""
    return game_service.list_juegos(db, categoria)


@router.get("/categorias")
def obtener_categorias(db: Session = Depends(get_db)):
    return game_service.list_categorias(db)


@router.get("/juegos/{id_juego}")
def obtener_detalle_juego(id_juego: int, db: Session = Depends(get_db)):
    return game_service.get_juego_detalle(db, id_juego)

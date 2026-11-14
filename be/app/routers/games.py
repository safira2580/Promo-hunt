from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.services import game_service

router = APIRouter(prefix="/api/v1", tags=["games"])


@router.get("/juegos")
def obtener_juegos(
    categoria: int | None = Query(None, description="Filtrar por id_categoria"),
    buscar: str | None = Query(None, max_length=100, description="Buscar por nombre"),
    db: Session = Depends(get_db),
):
    """Lista juegos con descuentos activos (compatible con el frontend actual)."""
    return game_service.list_juegos(db, categoria, buscar)


@router.get("/categorias")
def obtener_categorias(db: Session = Depends(get_db)):
    return game_service.list_categorias(db)


@router.get("/juegos/{id_juego}")
def obtener_detalle_juego(id_juego: int, db: Session = Depends(get_db)):
    return game_service.get_juego_detalle(db, id_juego)


@router.get("/resenas")
def obtener_resenas(
    limit: int = Query(500, ge=1, le=2000, description="Máximo de reseñas a devolver"),
    db: Session = Depends(get_db),
):
    """
    Reseñas públicas de todos los juegos, de la más reciente a la más antigua.

    Incluye el juego y la categoría del juego para que el frontend pueda filtrar
    por categoría y por juego de forma independiente. No expone datos privados
    del usuario (solo su nombre).
    """
    filas = (
        db.execute(
            text(
                """
                SELECT r.id_resena, r.id_juego, j.nombre AS juego,
                       j.id_categoria, c.nombre AS categoria,
                       u.nombre AS usuario, r.titulo, r.comentario,
                       r.calificacion, r.fecha_publicacion
                FROM resena r
                INNER JOIN juego j ON r.id_juego = j.id_juego
                INNER JOIN usuario u ON r.id_usuario = u.id_usuario
                LEFT JOIN categoria c ON j.id_categoria = c.id_categoria
                ORDER BY r.fecha_publicacion DESC NULLS LAST, r.id_resena DESC
                LIMIT :limit
                """
            ),
            {"limit": limit},
        )
        .mappings()
        .all()
    )
    return [dict(f) for f in filas]

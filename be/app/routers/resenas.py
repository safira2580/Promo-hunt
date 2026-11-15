"""
Reseñas escritas por los usuarios (requieren sesión) y lista ligera de juegos.

  POST /api/v1/resenas       -> publica una reseña del usuario autenticado
  GET  /api/v1/juegos-lista  -> id, nombre e imagen de los juegos activos
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/v1", tags=["resenas"])


class ResenaCrear(BaseModel):
    # El usuario sale del token: nunca se acepta un id_usuario enviado por el cliente
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    id_juego: int
    titulo: str = Field(min_length=1, max_length=150)
    comentario: str = Field(min_length=1, max_length=2000)
    calificacion: int = Field(ge=1, le=5)


@router.get("/juegos-lista")
def lista_juegos(db: Session = Depends(get_db)):
    """Todos los juegos activos (no solo los que tienen descuento), ordenados por nombre."""
    filas = (
        db.execute(
            text(
                """
                SELECT id_juego, nombre, imagen
                FROM juego
                WHERE COALESCE(estado, 'Activo') = 'Activo'
                ORDER BY nombre ASC
                """
            )
        )
        .mappings()
        .all()
    )
    return [dict(f) for f in filas]


@router.post("/resenas", status_code=201)
def crear_resena(
    datos: ResenaCrear,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_user),
):
    """Publica una reseña a nombre del usuario con sesión iniciada."""
    juego = db.execute(
        text("SELECT 1 FROM juego WHERE id_juego = :id"), {"id": datos.id_juego}
    ).first()
    if juego is None:
        raise HTTPException(404, "Juego no encontrado")

    # Una reseña por usuario y juego (evita duplicados y spam)
    existente = db.execute(
        text("SELECT 1 FROM resena WHERE id_usuario = :u AND id_juego = :j"),
        {"u": usuario.id_usuario, "j": datos.id_juego},
    ).first()
    if existente is not None:
        raise HTTPException(409, "Ya escribiste una reseña para este juego")

    nuevo_id = db.execute(
        text(
            """
            INSERT INTO resena (id_usuario, id_juego, titulo, comentario, calificacion)
            VALUES (:u, :j, :titulo, :comentario, :calificacion)
            RETURNING id_resena
            """
        ),
        {
            "u": usuario.id_usuario,
            "j": datos.id_juego,
            "titulo": datos.titulo,
            "comentario": datos.comentario,
            "calificacion": datos.calificacion,
        },
    ).scalar_one()
    db.commit()

    return {"ok": True, "mensaje": "Reseña publicada correctamente", "id_resena": nuevo_id}


@router.get("/juegos/{id_juego}/resenas")
def resumen_resenas_juego(id_juego: int, db: Session = Depends(get_db)):
    """Promedio y total de reseñas de PromoHunt para la ficha de un juego."""
    fila = (
        db.execute(
            text(
                """
                SELECT ROUND(AVG(calificacion)::numeric, 1) AS promedio, COUNT(*) AS total
                FROM resena
                WHERE id_juego = :id
                """
            ),
            {"id": id_juego},
        )
        .mappings()
        .first()
    )
    promedio = fila["promedio"] if fila else None
    return {
        "promedio": float(promedio) if promedio is not None else None,
        "total": int(fila["total"]) if fila else 0,
        # La calificación de Steam y Epic viene de datos externos, no de esta tabla
        "por_tienda": {},
    }

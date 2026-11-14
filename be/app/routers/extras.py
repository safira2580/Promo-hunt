"""Favoritos, reseñas públicas, reembolsos y lista de juegos (rutas que usa el frontend)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1", tags=["extras"])


# ---------------------------------------------------------------- juegos-lista
@router.get("/juegos-lista")
def juegos_lista(db: Session = Depends(get_db)):
    rows = (
        db.execute(text("SELECT id_juego, nombre, imagen FROM juego ORDER BY nombre ASC"))
        .mappings()
        .all()
    )
    return [dict(r) for r in rows]


# --------------------------------------------------------------------- reseñas
@router.get("/resenas")
def resenas_publicas(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
            SELECT r.id_resena, u.nombre AS usuario, r.id_juego, j.nombre AS juego,
                   j.imagen, r.titulo, r.comentario, r.calificacion, r.fecha_publicacion
            FROM resena r
            INNER JOIN usuario u ON u.id_usuario = r.id_usuario
            INNER JOIN juego j ON j.id_juego = r.id_juego
            ORDER BY r.fecha_publicacion DESC NULLS LAST, r.id_resena DESC
            """
            )
        )
        .mappings()
        .all()
    )
    return [dict(r) for r in rows]


# ------------------------------------------------------------------- favoritos
@router.get("/favoritos")
def listar_favoritos(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.execute(
            text(
                """
            SELECT j.id_juego, j.nombre, j.imagen,
                   d.porcentaje_descuento, d.precio_descuento, d.precio_original
            FROM favorito f
            INNER JOIN juego j ON j.id_juego = f.id_juego
            LEFT JOIN LATERAL (
                SELECT porcentaje_descuento, precio_descuento, precio_original
                FROM descuento
                WHERE id_juego = j.id_juego AND estado = 'Activo'
                ORDER BY porcentaje_descuento DESC NULLS LAST
                LIMIT 1
            ) d ON TRUE
            WHERE f.id_usuario = :uid
            ORDER BY f.id_favorito DESC
            """
            ),
            {"uid": current_user.id_usuario},
        )
        .mappings()
        .all()
    )
    return [dict(r) for r in rows]


def _existe_juego(db: Session, id_juego: int) -> None:
    ok = db.execute(text("SELECT 1 FROM juego WHERE id_juego = :id"), {"id": id_juego}).first()
    if not ok:
        raise HTTPException(404, "El juego no existe")


@router.post("/favoritos/{id_juego}", status_code=201)
def agregar_favorito(
    id_juego: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _existe_juego(db, id_juego)
    db.execute(
        text(
            "INSERT INTO favorito (id_usuario, id_juego) VALUES (:u, :j) "
            "ON CONFLICT (id_usuario, id_juego) DO NOTHING"
        ),
        {"u": current_user.id_usuario, "j": id_juego},
    )
    db.commit()
    return {"ok": True}


@router.delete("/favoritos/{id_juego}")
def quitar_favorito(
    id_juego: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(
        text("DELETE FROM favorito WHERE id_usuario = :u AND id_juego = :j"),
        {"u": current_user.id_usuario, "j": id_juego},
    )
    db.commit()
    return {"ok": True}


# ------------------------------------------------------------------ reembolsos
class ReembolsoIn(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    juego: str = Field(..., min_length=1, max_length=150)
    motivo: str = Field(..., min_length=3, max_length=1000)


@router.get("/reembolsos")
def listar_reembolsos(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    rows = (
        db.execute(
            text(
                """
            SELECT r.id_reembolso, j.nombre AS juego, r.motivo, r.estado, r.fecha_solicitud
            FROM reembolso r
            INNER JOIN juego j ON j.id_juego = r.id_juego
            WHERE r.id_usuario = :uid
            ORDER BY r.id_reembolso DESC
            """
            ),
            {"uid": current_user.id_usuario},
        )
        .mappings()
        .all()
    )
    return [dict(r) for r in rows]


@router.post("/reembolsos", status_code=201)
def solicitar_reembolso(
    datos: ReembolsoIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    juego = db.execute(
        text("SELECT id_juego FROM juego WHERE lower(nombre) = lower(:n)"),
        {"n": datos.juego},
    ).first()
    if not juego:
        raise HTTPException(404, "Ese juego no existe")
    db.execute(
        text("INSERT INTO reembolso (id_usuario, id_juego, motivo) VALUES (:u, :j, :m)"),
        {"u": current_user.id_usuario, "j": juego[0], "m": datos.motivo},
    )
    db.commit()
    return {"ok": True}

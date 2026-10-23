"""
Lógica de negocio de juegos y descuentos.
"""

from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session


def list_juegos(db: Session, categoria_id: int | None = None) -> list[dict]:
    sql = """
        SELECT
            juego.id_juego,
            juego.nombre,
            juego.fecha_lanzamiento,
            juego.imagen,
            juego.id_categoria,
            categoria.nombre AS categoria,
            descuento.id_descuento,
            descuento.id_plataforma,
            descuento.precio_original,
            descuento.precio_descuento,
            descuento.porcentaje_descuento,
            descuento.ahorro,
            descuento.estado,
            plataforma.nombre AS plataforma
        FROM juego
        INNER JOIN descuento ON juego.id_juego = descuento.id_juego
        INNER JOIN plataforma ON descuento.id_plataforma = plataforma.id_plataforma
        LEFT JOIN categoria ON juego.id_categoria = categoria.id_categoria
        WHERE descuento.estado = 'Activo'
    """
    params: dict = {}
    if categoria_id is not None:
        sql += " AND juego.id_categoria = :categoria_id"
        params["categoria_id"] = categoria_id
    sql += " ORDER BY descuento.porcentaje_descuento DESC"

    rows = db.execute(text(sql), params).mappings().all()
    return [dict(r) for r in rows]


def list_categorias(db: Session) -> list[dict]:
    rows = db.execute(
        text(
            "SELECT id_categoria, nombre, descripcion FROM categoria ORDER BY nombre ASC"
        )
    ).mappings().all()
    return [dict(r) for r in rows]


def get_juego_detalle(db: Session, id_juego: int) -> dict:
    juego = db.execute(
        text(
            """
            SELECT id_juego, nombre, fecha_lanzamiento, imagen, descripcion
            FROM juego WHERE id_juego = :id
            """
        ),
        {"id": id_juego},
    ).mappings().first()

    if not juego:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Juego no encontrado")

    descuentos = db.execute(
        text(
            """
            SELECT
                d.id_descuento,
                d.id_plataforma,
                d.precio_original,
                d.precio_descuento,
                d.porcentaje_descuento,
                d.ahorro,
                d.estado,
                p.nombre AS plataforma
            FROM descuento d
            INNER JOIN plataforma p ON d.id_plataforma = p.id_plataforma
            WHERE d.id_juego = :id AND d.estado = 'Activo'
            ORDER BY d.precio_descuento ASC
            """
        ),
        {"id": id_juego},
    ).mappings().all()

    return {
        "ok": True,
        "juego": dict(juego),
        "descuentos": [dict(d) for d in descuentos],
    }

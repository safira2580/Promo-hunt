"""Compras con validación de pago y biblioteca del usuario.

Flujo: POST /compras (el servidor fija el precio) -> POST /compras/{id}/pago
(valida y marca la compra) -> el juego aparece en GET /biblioteca.

PAYMENTS_MODE="simulado" aprueba/rechaza sin cobrar dinero real (demo). Para cobrar de
verdad, la confirmación debe venir de la pasarela (webhook con firma verificada), nunca
del navegador: ver README, sección Pagos.
"""

import secrets
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/v1", tags=["compras"])
settings = get_settings()


class CompraIn(BaseModel):
    # Se ignora cualquier otro campo (p. ej. un "monto" enviado por el cliente).
    model_config = ConfigDict(extra="ignore")

    id_descuento: int


class PagoIn(BaseModel):
    model_config = ConfigDict(extra="ignore")

    resultado: Literal["aprobado", "rechazado"] = "aprobado"


_SELECT_COMPRA = """
    SELECT c.id_compra, c.referencia, c.estado, c.monto, c.id_juego, j.nombre AS juego,
           COALESCE(p.nombre, '') AS plataforma
    FROM compra c
    INNER JOIN juego j ON j.id_juego = c.id_juego
    LEFT JOIN plataforma p ON p.id_plataforma = c.id_plataforma
"""


def _compra_dict(db: Session, id_compra: int, id_usuario: int) -> dict:
    fila = (
        db.execute(
            text(_SELECT_COMPRA + " WHERE c.id_compra = :c AND c.id_usuario = :u"),
            {"c": id_compra, "u": id_usuario},
        )
        .mappings()
        .first()
    )
    if fila is None:
        # 404 (y no 403) para no revelar que la compra existe y es de otra persona.
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    datos = dict(fila)
    datos["monto"] = float(datos["monto"])
    return datos


@router.post("/compras", status_code=201)
def crear_compra(
    datos: CompraIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    oferta = (
        db.execute(
            text(
                """
                SELECT d.id_descuento, d.id_juego, d.id_plataforma, d.precio_descuento
                FROM descuento d
                INNER JOIN juego j ON j.id_juego = d.id_juego
                WHERE d.id_descuento = :d AND d.estado = 'Activo'
                """
            ),
            {"d": datos.id_descuento},
        )
        .mappings()
        .first()
    )
    if oferta is None:
        raise HTTPException(status_code=404, detail="La oferta no existe o ya no está activa")

    previa = (
        db.execute(
            text(
                "SELECT id_compra, estado FROM compra "
                "WHERE id_usuario = :u AND id_juego = :j AND estado IN ('pendiente', 'pagada') "
                "FOR UPDATE"
            ),
            {"u": current_user.id_usuario, "j": oferta["id_juego"]},
        )
        .mappings()
        .first()
    )
    if previa and previa["estado"] == "pagada":
        raise HTTPException(status_code=409, detail="Ya tienes este juego en tu biblioteca")

    if previa:  # compra pendiente: se reutiliza con el precio vigente de la oferta elegida
        db.execute(
            text(
                "UPDATE compra SET monto = :m, id_descuento = :d, id_plataforma = :p "
                "WHERE id_compra = :c"
            ),
            {
                "m": oferta["precio_descuento"],
                "d": oferta["id_descuento"],
                "p": oferta["id_plataforma"],
                "c": previa["id_compra"],
            },
        )
        id_compra = previa["id_compra"]
    else:
        id_compra = db.execute(
            text(
                "INSERT INTO compra (id_usuario, id_juego, id_descuento, id_plataforma, "
                "monto, referencia) VALUES (:u, :j, :d, :p, :m, :r) RETURNING id_compra"
            ),
            {
                "u": current_user.id_usuario,
                "j": oferta["id_juego"],
                "d": oferta["id_descuento"],
                "p": oferta["id_plataforma"],
                "m": oferta["precio_descuento"],
                "r": "PH-" + secrets.token_hex(8).upper(),
            },
        ).scalar_one()
    db.commit()
    return _compra_dict(db, id_compra, current_user.id_usuario)


@router.get("/compras/{id_compra}")
def ver_compra(
    id_compra: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _compra_dict(db, id_compra, current_user.id_usuario)


@router.post("/compras/{id_compra}/pago")
def pagar_compra(
    id_compra: int,
    datos: PagoIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if settings.PAYMENTS_MODE != "simulado":
        raise HTTPException(status_code=501, detail="Los pagos no están habilitados")

    compra = (
        db.execute(
            text(
                "SELECT estado, id_juego, monto FROM compra "
                "WHERE id_compra = :c AND id_usuario = :u FOR UPDATE"
            ),
            {"c": id_compra, "u": current_user.id_usuario},
        )
        .mappings()
        .first()
    )
    if compra is None:
        raise HTTPException(status_code=404, detail="Compra no encontrada")

    if compra["estado"] == "pagada" and datos.resultado == "aprobado":
        return _compra_dict(db, id_compra, current_user.id_usuario)  # idempotente
    if compra["estado"] != "pendiente":
        raise HTTPException(status_code=409, detail=f"La compra ya está {compra['estado']}")

    if datos.resultado == "aprobado":
        db.execute(
            text(
                "UPDATE compra SET estado = 'pagada', metodo_pago = 'simulado', "
                "fecha_pago = CURRENT_TIMESTAMP WHERE id_compra = :c"
            ),
            {"c": id_compra},
        )
        actualizada = db.execute(
            text(
                "UPDATE venta SET copias_vendidas = copias_vendidas + 1, "
                "ingresos = ingresos + :m, ultima_actualizacion = CURRENT_TIMESTAMP "
                "WHERE id_juego = :j"
            ),
            {"m": compra["monto"], "j": compra["id_juego"]},
        ).rowcount
        if not actualizada:
            db.execute(
                text("INSERT INTO venta (id_juego, copias_vendidas, ingresos) VALUES (:j, 1, :m)"),
                {"j": compra["id_juego"], "m": compra["monto"]},
            )
    else:
        db.execute(
            text(
                "UPDATE compra SET estado = 'rechazada', metodo_pago = 'simulado' "
                "WHERE id_compra = :c"
            ),
            {"c": id_compra},
        )
    db.commit()
    return _compra_dict(db, id_compra, current_user.id_usuario)


@router.get("/biblioteca")
def biblioteca(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    filas = db.execute(
        text(
            """
            SELECT c.id_compra, c.referencia, j.id_juego, j.nombre, j.imagen,
                   COALESCE(p.nombre, '') AS plataforma,
                   c.monto AS precio_pagado, c.fecha_pago AS fecha_compra
            FROM compra c
            INNER JOIN juego j ON j.id_juego = c.id_juego
            LEFT JOIN plataforma p ON p.id_plataforma = c.id_plataforma
            WHERE c.id_usuario = :u AND c.estado = 'pagada'
            ORDER BY c.fecha_pago DESC
            """
        ),
        {"u": current_user.id_usuario},
    ).mappings()
    return [{**f, "precio_pagado": float(f["precio_pagado"])} for f in filas]

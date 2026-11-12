"""
Panel de administración — CRUD de juegos, descuentos, desarrolladores, géneros,
categorías y reseñas.

Seguridad (OWASP A01): TODO el router exige rol `admin` (dependencia `require_admin`);
sin token → 401, usuario normal → 403.
Integridad: las violaciones de FK / UNIQUE / CHECK de PostgreSQL se traducen a 409
mediante los manejadores globales de `app/errors.py` (nunca a un 500).

Las respuestas conservan la forma del backend Flask original para no romper el frontend:
  GET    /admin/<recurso>        -> {"ok": true, "<plural>": [...]}
  POST   /admin/<recurso>        -> 201 {"ok": true, "mensaje": "...", "id_<x>": n}
  PUT    /admin/<recurso>/{id}   -> {"ok": true, "mensaje": "..."}
  DELETE /admin/<recurso>/{id}   -> {"ok": true, "mensaje": "..."}
"""

from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field, model_validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_admin

router = APIRouter(
    prefix="/api/v1/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)


# ======================================================================
# Esquemas de entrada (lista blanca de columnas por recurso)
# ======================================================================
class _In(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    @model_validator(mode="before")
    @classmethod
    def _vacio_a_none(cls, data: Any):
        # El formulario envía "" para campos vacíos; PostgreSQL rechazaría "" en fechas/números
        if isinstance(data, dict):
            return {k: (None if v == "" else v) for k, v in data.items()}
        return data


class JuegoIn(_In):
    nombre: str | None = Field(None, max_length=150)
    descripcion: str | None = None
    fecha_lanzamiento: date | None = None
    imagen: str | None = Field(None, max_length=255)
    portada: str | None = Field(None, max_length=255)
    trailer: str | None = Field(None, max_length=255)
    edad_minima: int | None = Field(None, ge=0, le=21)
    idiomas_disponibles: str | None = None
    requisitos_minimos: str | None = None
    requisitos_recomendados: str | None = None
    modo_juego: str | None = Field(None, max_length=100)
    estado: str | None = Field(None, max_length=50)
    id_categoria: int | None = None
    id_genero: int | None = None
    id_desarrollador: int | None = None
    id_noticia: int | None = None


class DescuentoIn(_In):
    id_juego: int | None = None
    id_plataforma: int | None = None
    precio_original: Decimal | None = Field(None, ge=0, max_digits=10, decimal_places=2)
    precio_descuento: Decimal | None = Field(None, ge=0, max_digits=10, decimal_places=2)
    porcentaje_descuento: Decimal | None = Field(None, ge=0, le=100)
    ahorro: Decimal | None = Field(None, ge=0)
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    estado: str | None = Field(None, pattern="^(Activo|Inactivo|Expirado)$")


class DesarrolladorIn(_In):
    nombre: str | None = Field(None, max_length=150)
    pais: str | None = Field(None, max_length=100)
    ciudad: str | None = Field(None, max_length=100)
    fundacion: date | None = None
    sitio_web: str | None = Field(None, max_length=255)
    logo: str | None = Field(None, max_length=255)
    descripcion: str | None = None


class NombreDescripcionIn(_In):  # géneros y categorías
    nombre: str | None = Field(None, max_length=100)
    descripcion: str | None = None


class ResenaIn(_In):
    id_usuario: int | None = None
    id_juego: int | None = None
    titulo: str | None = Field(None, max_length=150)
    comentario: str | None = None
    calificacion: int | None = Field(None, ge=1, le=5)


# ======================================================================
# Reglas de negocio específicas
# ======================================================================
def _validar_descuento(d: dict) -> None:
    po, pd = d.get("precio_original"), d.get("precio_descuento")
    if po is not None and pd is not None and pd > po:
        raise HTTPException(422, "El precio con descuento no puede ser mayor al precio original")
    fi, ff = d.get("fecha_inicio"), d.get("fecha_fin")
    if fi and ff:
        # la columna es TIMESTAMP sin zona: se comparan fechas "naive" para evitar TypeError
        fi, ff = fi.replace(tzinfo=None), ff.replace(tzinfo=None)
    if fi and ff and ff < fi:
        raise HTTPException(422, "La fecha de fin no puede ser anterior a la fecha de inicio")


def _completar_descuento(d: dict) -> None:
    """Porcentaje y ahorro SIEMPRE se calculan a partir de los precios (no se aceptan manuales)."""
    po, pd = d.get("precio_original"), d.get("precio_descuento")
    if po is None or pd is None:
        return
    d["ahorro"] = po - pd
    d["porcentaje_descuento"] = (
        ((po - pd) / po * 100).quantize(Decimal("0.01")) if po > 0 else Decimal("0.00")
    )


# ======================================================================
# Definición declarativa de recursos
# ======================================================================
@dataclass
class Resource:
    path: str  # segmento de URL
    table: str
    pk: str
    plural: str  # clave de la lista en la respuesta GET
    nombre: str  # "Juego"
    femenino: bool
    model: type[_In]
    list_sql: str
    requeridos: dict[str, str] = field(default_factory=dict)  # campo -> mensaje
    validar: Callable[[dict], None] | None = None
    completar: Callable[[dict], None] | None = None
    derivados: tuple[str, ...] = ()  # campos calculados por `completar` (se recalculan al editar)

    @property
    def agregado(self) -> str:
        return f"{self.nombre} {'agregada' if self.femenino else 'agregado'} correctamente"

    @property
    def actualizado(self) -> str:
        return f"{self.nombre} {'actualizada' if self.femenino else 'actualizado'} correctamente"

    @property
    def eliminado(self) -> str:
        return f"{self.nombre} {'eliminada' if self.femenino else 'eliminado'} correctamente"

    @property
    def no_encontrado(self) -> str:
        return f"{self.nombre} no {'encontrada' if self.femenino else 'encontrado'}"


RESOURCES = [
    Resource(
        "juegos",
        "juego",
        "id_juego",
        "juegos",
        "Juego",
        False,
        JuegoIn,
        """
        SELECT j.id_juego, j.nombre, j.descripcion, j.fecha_lanzamiento, j.imagen, j.portada,
               j.trailer, j.edad_minima, j.idiomas_disponibles, j.requisitos_minimos,
               j.requisitos_recomendados, j.modo_juego, j.estado,
               j.id_categoria, c.nombre AS categoria,
               j.id_genero, g.nombre AS genero,
               j.id_desarrollador, d.nombre AS desarrollador,
               j.id_noticia
        FROM juego j
        LEFT JOIN categoria c ON j.id_categoria = c.id_categoria
        LEFT JOIN genero g ON j.id_genero = g.id_genero
        LEFT JOIN desarrollador d ON j.id_desarrollador = d.id_desarrollador
        ORDER BY j.id_juego ASC
        """,
        requeridos={"nombre": "El nombre del juego es obligatorio"},
    ),
    Resource(
        "descuentos",
        "descuento",
        "id_descuento",
        "descuentos",
        "Descuento",
        False,
        DescuentoIn,
        """
        SELECT d.id_descuento, d.id_juego, j.nombre AS juego,
               d.id_plataforma, p.nombre AS plataforma,
               d.precio_original, d.precio_descuento, d.porcentaje_descuento, d.ahorro,
               d.fecha_inicio, d.fecha_fin, d.estado
        FROM descuento d
        INNER JOIN juego j ON d.id_juego = j.id_juego
        INNER JOIN plataforma p ON d.id_plataforma = p.id_plataforma
        ORDER BY d.id_descuento ASC
        """,
        requeridos={
            "id_juego": "El juego es obligatorio",
            "id_plataforma": "La plataforma es obligatoria",
            "precio_original": "El precio original es obligatorio",
            "precio_descuento": "El precio con descuento es obligatorio",
        },
        validar=_validar_descuento,
        completar=_completar_descuento,
        derivados=("porcentaje_descuento", "ahorro"),
    ),
    Resource(
        "desarrolladores",
        "desarrollador",
        "id_desarrollador",
        "desarrolladores",
        "Desarrollador",
        False,
        DesarrolladorIn,
        """
        SELECT id_desarrollador, nombre, pais, ciudad, fundacion, sitio_web, logo, descripcion
        FROM desarrollador ORDER BY id_desarrollador ASC
        """,
        requeridos={"nombre": "El nombre del desarrollador es obligatorio"},
    ),
    Resource(
        "generos",
        "genero",
        "id_genero",
        "generos",
        "Género",
        False,
        NombreDescripcionIn,
        "SELECT id_genero, nombre, descripcion, fecha_creacion FROM genero ORDER BY id_genero ASC",
        requeridos={"nombre": "El nombre del género es obligatorio"},
    ),
    Resource(
        "categoria",
        "categoria",
        "id_categoria",
        "categoria",
        "Categoría",
        True,
        NombreDescripcionIn,
        "SELECT id_categoria, nombre, descripcion, fecha_creacion "
        "FROM categoria ORDER BY id_categoria ASC",
        requeridos={"nombre": "El nombre de la categoría es obligatorio"},
    ),
    Resource(
        "resenas",
        "resena",
        "id_resena",
        "resenas",
        "Reseña",
        True,
        ResenaIn,
        """
        SELECT r.id_resena, r.id_usuario, u.nombre AS usuario, r.id_juego, j.nombre AS juego,
               r.titulo, r.comentario, r.calificacion, r.fecha_publicacion
        FROM resena r
        INNER JOIN usuario u ON r.id_usuario = u.id_usuario
        INNER JOIN juego j ON r.id_juego = j.id_juego
        ORDER BY r.id_resena ASC
        """,
        requeridos={
            "id_usuario": "El usuario es obligatorio",
            "id_juego": "El juego es obligatorio",
            "calificacion": "La calificación (1 a 5) es obligatoria",
        },
    ),
]


# ======================================================================
# Generación de rutas
# ======================================================================
def _faltantes(res: Resource, datos: dict) -> None:
    for campo, mensaje in res.requeridos.items():
        if datos.get(campo) is None or datos.get(campo) == "":
            raise HTTPException(422, mensaje)


def _registrar(res: Resource) -> None:
    Model = res.model
    base = f"/{res.path}"

    @router.get(base, name=f"admin_listar_{res.path}")
    def listar(
        limit: int = Query(1000, ge=1, le=5000),
        offset: int = Query(0, ge=0),
        db: Session = Depends(get_db),
    ):
        sql = res.list_sql.rstrip() + " LIMIT :limit OFFSET :offset"
        filas = db.execute(text(sql), {"limit": limit, "offset": offset}).mappings().all()
        return {"ok": True, res.plural: [dict(f) for f in filas]}

    @router.post(base, status_code=201, name=f"admin_crear_{res.path}")
    def crear(datos: Model, db: Session = Depends(get_db)):  # type: ignore[valid-type]
        valores = datos.model_dump(exclude_unset=True)
        _faltantes(res, valores)
        if res.completar:
            res.completar(valores)
        if res.validar:
            res.validar(valores)
        columnas = list(valores.keys())
        sql = (
            f"INSERT INTO {res.table} ({', '.join(columnas)}) "
            f"VALUES ({', '.join(':' + c for c in columnas)}) RETURNING {res.pk}"
        )
        nuevo_id = db.execute(text(sql), valores).scalar_one()
        db.commit()
        return JSONResponse(
            status_code=201, content={"ok": True, "mensaje": res.agregado, res.pk: nuevo_id}
        )

    @router.put(base + "/{item_id}", name=f"admin_editar_{res.path}")
    def editar(item_id: int, datos: Model, db: Session = Depends(get_db)):  # type: ignore[valid-type]
        cambios = datos.model_dump(exclude_unset=True)
        actual = (
            db.execute(text(f"SELECT * FROM {res.table} WHERE {res.pk} = :id"), {"id": item_id})
            .mappings()
            .first()
        )
        if actual is None:
            raise HTTPException(404, res.no_encontrado)
        for campo in res.requeridos:
            if campo in cambios and cambios[campo] is None:
                raise HTTPException(422, res.requeridos[campo])
        if cambios:
            fusion = {**dict(actual), **cambios}
            if (
                res.completar
                and res.derivados
                and ("precio_original" in cambios or "precio_descuento" in cambios)
            ):
                res.completar(fusion)
                cambios.update({k: fusion[k] for k in res.derivados})
            if res.validar:
                res.validar(fusion)
            sets = ", ".join(f"{c} = :{c}" for c in cambios)
            db.execute(
                text(f"UPDATE {res.table} SET {sets} WHERE {res.pk} = :_id"),
                {**cambios, "_id": item_id},
            )
            db.commit()
        return {"ok": True, "mensaje": res.actualizado}

    @router.delete(base + "/{item_id}", name=f"admin_eliminar_{res.path}")
    def eliminar(item_id: int, db: Session = Depends(get_db)):
        borrado = db.execute(
            text(f"DELETE FROM {res.table} WHERE {res.pk} = :id RETURNING {res.pk}"),
            {"id": item_id},
        ).first()
        if borrado is None:
            raise HTTPException(404, res.no_encontrado)
        db.commit()
        return {"ok": True, "mensaje": res.eliminado}


for _res in RESOURCES:
    _registrar(_res)

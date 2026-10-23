from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class CategoriaResponse(BaseModel):
    id_categoria: int
    nombre: str
    descripcion: str | None = None

    model_config = {"from_attributes": True}


class DescuentoResponse(BaseModel):
    id_descuento: int
    id_plataforma: int
    plataforma: str | None = None
    precio_original: Decimal
    precio_descuento: Decimal
    porcentaje_descuento: Decimal | None = None
    ahorro: Decimal | None = None
    estado: str

    model_config = {"from_attributes": True}


class JuegoListItem(BaseModel):
    id_juego: int
    nombre: str
    fecha_lanzamiento: date | None = None
    imagen: str | None = None
    id_categoria: int | None = None
    categoria: str | None = None
    id_descuento: int | None = None
    id_plataforma: int | None = None
    precio_original: Decimal | None = None
    precio_descuento: Decimal | None = None
    porcentaje_descuento: Decimal | None = None
    ahorro: Decimal | None = None
    estado: str | None = None
    plataforma: str | None = None


class JuegoDetalleResponse(BaseModel):
    ok: bool = True
    juego: dict
    descuentos: list[DescuentoResponse]

"""
Modelos del dominio PromoHunt: categorías, plataformas, juegos y descuentos.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class Plataforma(Base):
    __tablename__ = "plataforma"

    id_plataforma: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    url_tienda: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logo: Mapped[str | None] = mapped_column(String(255), nullable=True)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)


class Juego(Base):
    __tablename__ = "juego"

    id_juego: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    fecha_lanzamiento: Mapped[date | None] = mapped_column(Date, nullable=True)
    imagen: Mapped[str | None] = mapped_column(String(255), nullable=True)
    portada: Mapped[str | None] = mapped_column(String(255), nullable=True)
    estado: Mapped[str] = mapped_column(String(50), default="Disponible")
    id_categoria: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("categoria.id_categoria"), nullable=True
    )

    descuentos: Mapped[list["Descuento"]] = relationship(back_populates="juego")


class Descuento(Base):
    __tablename__ = "descuento"

    id_descuento: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_juego: Mapped[int] = mapped_column(Integer, ForeignKey("juego.id_juego"), nullable=False)
    id_plataforma: Mapped[int] = mapped_column(
        Integer, ForeignKey("plataforma.id_plataforma"), nullable=False
    )
    precio_original: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    precio_descuento: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    porcentaje_descuento: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    ahorro: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    estado: Mapped[str] = mapped_column(String(50), default="Activo")

    juego: Mapped["Juego"] = relationship(back_populates="descuentos")

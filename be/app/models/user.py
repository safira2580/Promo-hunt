"""
Modelo ORM de usuario.
¿Qué? Representa la tabla usuario.
¿Para qué? Auth JWT, perfil y roles (user/admin).
¿Impacto? Sin hashing ni is_active, las cuentas no serían seguras ni desactivables.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    correo: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    # Hash bcrypt — NUNCA guardar contraseña en texto plano
    contrasena: Mapped[str] = mapped_column(String(255), nullable=False)
    foto_perfil: Mapped[str | None] = mapped_column(String(255), nullable=True)
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    rol: Mapped[str] = mapped_column(String(30), nullable=False, default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

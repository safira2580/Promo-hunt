"""Perfil del usuario autenticado (consultar y editar)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/v1/usuario", tags=["usuario"])


class PerfilIn(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)

    nombre: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    contrasena_actual: str | None = Field(None, max_length=128)
    nueva_contrasena: str | None = Field(None, min_length=6, max_length=128)


@router.get("/perfil")
def perfil(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    crossplay = (
        db.execute(
            text("SELECT * FROM crossplay WHERE id_usuario = :id"), {"id": current_user.id_usuario}
        )
        .mappings()
        .first()
    )
    return {
        "logueado": True,
        "usuario": UserResponse.model_validate(current_user),
        "crossplay": dict(crossplay) if crossplay else None,
    }


@router.put("/editar")
def editar(
    datos: PerfilIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    otro = (
        db.query(User)
        .filter(User.correo == datos.correo, User.id_usuario != current_user.id_usuario)
        .first()
    )
    if otro:
        raise HTTPException(409, "Ese correo ya está siendo utilizado")

    if datos.nueva_contrasena:
        if not datos.contrasena_actual:
            raise HTTPException(422, "Debes ingresar tu contraseña actual")
        if not verify_password(datos.contrasena_actual, current_user.contrasena):
            raise HTTPException(400, "La contraseña actual es incorrecta")
        current_user.contrasena = hash_password(datos.nueva_contrasena)

    current_user.nombre = datos.nombre
    current_user.correo = datos.correo
    db.commit()
    return {"ok": True, "mensaje": "Perfil actualizado correctamente"}

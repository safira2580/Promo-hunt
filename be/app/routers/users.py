"""Perfil del usuario autenticado (consultar y editar)."""
import shutil

from pathlib import Path
from fastapi import File, Form, UploadFile
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
    nombre: str = Form(..., min_length=2, max_length=100),
    correo: EmailStr = Form(...),
    contrasena_actual: str | None = Form(None, max_length=128),
    nueva_contrasena: str | None = Form(None, min_length=6, max_length=128),
    foto: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 1. Verificar si el correo ya está en uso por otro usuario
    otro = (
        db.query(User)
        .filter(User.correo == correo, User.id_usuario != current_user.id_usuario)
        .first()
    )
    if otro:
        raise HTTPException(409, "Ese correo ya está siendo utilizado")

    # 2. Validar y actualizar contraseña si se proporciona
    if nueva_contrasena:
        if not contrasena_actual:
            raise HTTPException(422, "Debes ingresar tu contraseña actual")
        if not verify_password(contrasena_actual, current_user.contrasena):
            raise HTTPException(400, "La contraseña actual es incorrecta")
        current_user.contrasena = hash_password(nueva_contrasena)

    # 3. Procesar la foto de perfil si el usuario subió una nueva
    if foto is not None:
        extension = Path(foto.filename).suffix.lower()
        if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(400, "Formato de imagen no permitido")

        # Crear nombre único usando el ID del usuario y parte de su correo
        correo_limpio = current_user.correo.split("@")[0].replace(".", "_")
        nombre_archivo = f"user_{current_user.id_usuario}_{correo_limpio}{extension}"
        
        # Asegurar que la carpeta static/img exista en el backend
        directorio_destino = Path("static/img")
        directorio_destino.mkdir(parents=True, exist_ok=True)
        
        ruta_destino = directorio_destino / nombre_archivo

        try:
            with open(ruta_destino, "wb") as buffer:
                shutil.copyfileobj(foto.file, buffer)
        except Exception:
            raise HTTPException(500, "Error al guardar la imagen en el servidor")

        # Guardar el nombre del archivo en el campo correspondiente del modelo
        current_user.foto_perfil = nombre_archivo

    # 4. Actualizar datos de texto y guardar cambios en la base de datos
    current_user.nombre = nombre
    current_user.correo = correo
    db.commit()
    db.refresh(current_user)

    return {
        "ok": True, 
        "mensaje": "Perfil actualizado correctamente",
        "foto_perfil": current_user.foto_perfil
    }

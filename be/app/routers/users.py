"""Perfil del usuario autenticado (consultar y editar)."""

import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/v1/usuario", tags=["usuario"])


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
async def editar(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = request.headers.get("content-type", "")

    nombre_val = current_user.nombre
    correo_val = current_user.correo
    contrasena_actual_val = None
    nueva_contrasena_val = None
    foto = None

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            body = {}
        nombre_val = body.get("nombre", current_user.nombre)
        correo_val = body.get("correo", current_user.correo)
        contrasena_actual_val = body.get("contrasena_actual")
        nueva_contrasena_val = body.get("nueva_contrasena")
    else:
        form = await request.form()
        nombre_val = form.get("nombre", current_user.nombre)
        correo_val = form.get("correo", current_user.correo)
        contrasena_actual_val = form.get("contrasena_actual")
        nueva_contrasena_val = form.get("nueva_contrasena")
        foto = form.get("foto")

    if not nombre_val or len(nombre_val) < 2 or len(nombre_val) > 100:
        raise HTTPException(422, "El nombre debe tener entre 2 y 100 caracteres")

    # 1. Verificar si el correo ya está en uso por otro usuario (409)
    otro = (
        db.query(User)
        .filter(User.correo == correo_val, User.id_usuario != current_user.id_usuario)
        .first()
    )
    if otro:
        raise HTTPException(409, "Ese correo ya está siendo utilizado")

    # 2. Validar contraseña si se proporciona nueva_contrasena (422 o 400)
    if nueva_contrasena_val:
        if len(nueva_contrasena_val) < 6:
            raise HTTPException(422, "La nueva contraseña debe tener al menos 6 caracteres")
        if not contrasena_actual_val:
            raise HTTPException(422, "Debes ingresar tu contraseña actual")
        if not verify_password(contrasena_actual_val, current_user.contrasena):
            raise HTTPException(400, "La contraseña actual es incorrecta")
        current_user.contrasena = hash_password(nueva_contrasena_val)

    # 3. Procesar la foto de perfil si el usuario subió una nueva
    if foto is not None and hasattr(foto, "filename") and foto.filename:
        extension = Path(foto.filename).suffix.lower()
        if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(400, "Formato de imagen no permitido")

        correo_limpio = current_user.correo.split("@")[0].replace(".", "_")
        nombre_archivo = f"user_{current_user.id_usuario}_{correo_limpio}{extension}"

        if os.environ.get("ENVIRONMENT") == "production":
            ruta_base = "/app/static/img"
        else:
            ruta_base = "static/img"

        directorio_destino = Path(ruta_base)
        directorio_destino.mkdir(parents=True, exist_ok=True)

        ruta_destino = directorio_destino / nombre_archivo

        try:
            contents = await foto.read()
            with open(ruta_destino, "wb") as buffer:
                buffer.write(contents)
        except Exception as err:
            raise HTTPException(500, "Error al guardar la imagen en el servidor") from err

        current_user.foto_perfil = nombre_archivo

    # 4. Actualizar datos de texto y guardar cambios en la base de datos
    current_user.nombre = nombre_val
    current_user.correo = correo_val
    db.commit()
    db.refresh(current_user)

    return {
        "ok": True,
        "mensaje": "Perfil actualizado correctamente",
        "foto_perfil": current_user.foto_perfil,
    }

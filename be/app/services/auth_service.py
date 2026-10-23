"""
Lógica de negocio de autenticación (separada de los routers).
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)


def register_user(db: Session, data: UserCreate) -> UserResponse:
    existing = db.query(User).filter(User.correo == data.correo).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo ya está registrado",
        )

    user = User(
        nombre=data.nombre,
        correo=data.correo,
        contrasena=hash_password(data.contrasena),
        rol="user",
        is_active=True,
        is_verified=False,  # En producción: enviar email de verificación
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


def login_user(db: Session, data: UserLogin) -> TokenResponse:
    user = db.query(User).filter(User.correo == data.correo).first()
    if user is None or not verify_password(data.contrasena, user.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada",
        )

    access = create_access_token(user.id_usuario, extra={"rol": user.rol})
    refresh = create_refresh_token(user.id_usuario)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        usuario=UserResponse.model_validate(user),
    )

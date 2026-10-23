from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    contrasena: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    correo: EmailStr
    contrasena: str


class UserResponse(BaseModel):
    id_usuario: int
    nombre: str
    correo: EmailStr
    foto_perfil: str | None = None
    fecha_registro: datetime | None = None
    rol: str
    is_verified: bool = False

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    usuario: UserResponse


class MessageResponse(BaseModel):
    ok: bool = True
    mensaje: str

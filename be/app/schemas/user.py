from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    contrasena: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    # Sin EmailStr: el formato se valida al registrar, no al autenticar
    correo: str = Field(..., min_length=3, max_length=100)
    contrasena: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    id_usuario: int
    nombre: str
    correo: str  # str (no EmailStr): datos ya almacenados no deben romper la respuesta
    foto_perfil: str | None = None
    fecha_registro: datetime | None = None
    rol: str
    is_verified: bool = False

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"  # noqa: S105 (tipo de esquema OAuth2, no es un secreto)
    usuario: UserResponse


class MessageResponse(BaseModel):
    ok: bool = True
    mensaje: str

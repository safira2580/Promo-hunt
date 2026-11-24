import json
import os
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.utils.security import hash_password, verify_password

settings = get_settings()
SECRET_KEY = getattr(settings, "SECRET_KEY", os.environ.get("SECRET_KEY", "cambia-esta-clave-secreta"))
ALGORITHM = "HS256"


class SolicitarResetRequest(BaseModel):
    correo: EmailStr


class ConfirmarResetRequest(BaseModel):
    token: str
    contrasena_actual: str
    nueva_contrasena: str
    confirmar_contrasena: str


def _buscar_usuario_por_correo(db: Session, correo: str) -> User | None:
    correo_limpio = correo.strip().lower()
    return db.query(User).filter(func.lower(User.correo) == correo_limpio).first()


def _crear_token_reset(user: User) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id_usuario),
        "correo": user.correo.strip().lower(),
        "purpose": "password_reset",
        "jti": str(uuid.uuid4()),
        "iat": ahora,
        "exp": ahora + timedelta(minutes=15),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _leer_token_reset(token: str) -> dict:
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if data.get("purpose") != "password_reset" or not data.get("correo"):
            raise HTTPException(status_code=400, detail="Enlace no válido")
        return data
    except jwt.ExpiredSignatureError as err:
        raise HTTPException(status_code=400, detail="El enlace ha expirado") from err
    except jwt.InvalidTokenError as err:
        raise HTTPException(status_code=400, detail="Enlace inválido") from err


def _enviar_correo_reset(destinatario: str, enlace: str) -> None:
    resend_api_key = os.environ.get("RESEND_API_KEY", "").strip()
    email_from = os.environ.get("EMAIL_FROM", "PromoHunt <onboarding@resend.dev>").strip()

    html_body = f"""
    <div style="font-family: Arial, sans-serif; background: #0b0f19; color: #ffffff; padding: 32px; border-radius: 12px; max-width: 520px; margin: 0 auto;">
      <h2 style="margin-top: 0;">Recuperar contraseña — PromoHunt</h2>
      <p>Solicitaste restablecer la contraseña de la cuenta <strong>{destinatario}</strong>.</p>
      <p>Haz clic en el siguiente botón para abrir la página de cambio de contraseña (válido por 15 minutos):</p>
      <div style="margin: 24px 0;">
        <a href="{enlace}"
           style="display: inline-block; background: linear-gradient(90deg, #00b4db, #2563eb);
                  color: #ffffff; text-decoration: none; padding: 12px 24px;
                  border-radius: 8px; font-weight: bold;">
          Cambiar contraseña
        </a>
      </div>
      <p style="font-size: 12px; color: #9ca3af;">Si no solicitaste este cambio, ignora este mensaje.</p>
    </div>
    """

    if not resend_api_key:
        print(f"[DEV EMAIL - SIN RESEND_API_KEY] Para: {destinatario} | Enlace reset: {enlace}")
        return

    payload = {
        "from": email_from,
        "to": [destinatario],
        "subject": "Restablece tu contraseña en PromoHunt",
        "html": html_body,
    }

    req = urllib.request.Request(
        url="https://api.resend.com/emails",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json",
            "User-Agent": "PromoHunt-Backend/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            cuerpo = resp.read().decode("utf-8", errors="replace")
            print(f"[RESEND OK] Status {resp.status}: {cuerpo}")
    except urllib.error.HTTPError as err:
        detalle = err.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail=f"No se pudo enviar el correo: {detalle}") from err
    except urllib.error.URLError as err:
        raise HTTPException(status_code=502, detail=f"Error de conexión con Resend: {err.reason}") from err


@router.post("/recuperar-password")
def recuperar_password(payload: SolicitarResetRequest, db: Session = Depends(get_db)):
    user = _buscar_usuario_por_correo(db, payload.correo)
    if not user:
        raise HTTPException(status_code=404, detail="Ese correo no existe")

    frontend_url = os.environ.get("FRONTEND_URL", "https://promo-hunt-production.up.railway.app").rstrip("/")
    token = _crear_token_reset(user)
    enlace = f"{frontend_url}/restablecer-contrasena?token={token}"
    _enviar_correo_reset(user.correo, enlace)

    return {
        "ok": True,
        "mensaje": f"Se envió un enlace de recuperación a {user.correo}",
    }


@router.get("/validar-token-reset")
def validar_token_reset(token: str, db: Session = Depends(get_db)):
    data = _leer_token_reset(token)
    user = _buscar_usuario_por_correo(db, data["correo"])
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {"valido": True, "correo": user.correo}


@router.post("/restablecer-password")
def restablecer_password(payload: ConfirmarResetRequest, db: Session = Depends(get_db)):
    data = _leer_token_reset(payload.token)

    if payload.nueva_contrasena != payload.confirmar_contrasena:
        raise HTTPException(status_code=400, detail="Las contraseñas nuevas no coinciden")

    if len(payload.nueva_contrasena) < 6:
        raise HTTPException(status_code=422, detail="La nueva contraseña debe tener al menos 6 caracteres")

    user = _buscar_usuario_por_correo(db, data["correo"])
    if not user:
        raise HTTPException(status_code=404, detail="Ese correo no existe")

    if not verify_password(payload.contrasena_actual, user.contrasena):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")

    user.contrasena = hash_password(payload.nueva_contrasena)
    db.commit()

    return {"ok": True, "mensaje": "Contraseña actualizada correctamente"}
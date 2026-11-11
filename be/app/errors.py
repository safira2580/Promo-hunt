"""
Manejo de errores centralizado.

Objetivo: ninguna excepción llega al cliente como un 500 con traza, y todas las
respuestas de error comparten forma: {"ok": false, "detail": "...", "mensaje": "..."}
(`detail` es el estándar de FastAPI; `mensaje` mantiene compatibilidad con el frontend).
"""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import DataError, IntegrityError, OperationalError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

log = logging.getLogger("promohunt")


def _body(status_code: int, message: str, **extra) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"ok": False, "detail": message, "mensaje": message, **extra},
    )


def _pg_code(exc: SQLAlchemyError) -> str | None:
    return getattr(getattr(exc, "orig", None), "pgcode", None)


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def http_exc(_: Request, exc: StarletteHTTPException):
        resp = _body(exc.status_code, str(exc.detail))
        if exc.headers:
            resp.headers.update(exc.headers)
        return resp

    @app.exception_handler(RequestValidationError)
    async def validation_exc(_: Request, exc: RequestValidationError):
        errores = [
            {"campo": ".".join(str(x) for x in e["loc"] if x != "body"), "error": e["msg"]}
            for e in exc.errors()
        ]
        primero = errores[0] if errores else {"campo": "", "error": "Datos inválidos"}
        msg = f"{primero['campo']}: {primero['error']}" if primero["campo"] else primero["error"]
        # `detail` conserva la lista estándar de FastAPI; `mensaje` es legible para la UI
        return JSONResponse(
            status_code=422,
            content={"ok": False, "detail": exc.errors(), "mensaje": msg, "errores": errores},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_exc(_: Request, exc: IntegrityError):
        code = _pg_code(exc)
        if code == "23503":  # foreign_key_violation
            msg = (
                "No se puede completar la operación: el registro está relacionado con otros "
                "datos o hace referencia a un elemento que no existe"
            )
        elif code == "23505":  # unique_violation
            msg = "Ya existe un registro con esos datos"
        elif code == "23514":  # check_violation
            msg = "Los datos no cumplen las reglas de validación (valores fuera de rango)"
        elif code == "23502":  # not_null_violation
            msg = "Falta un dato obligatorio"
        else:
            msg = "Conflicto de integridad de datos"
        log.warning("IntegrityError %s: %s", code, getattr(exc, "orig", exc))
        return _body(409, msg)

    @app.exception_handler(DataError)
    async def data_exc(_: Request, exc: DataError):
        log.warning("DataError: %s", getattr(exc, "orig", exc))
        return _body(422, "Formato de datos inválido (revisa fechas, números y longitudes)")

    @app.exception_handler(OperationalError)
    async def operational_exc(_: Request, exc: OperationalError):
        log.error("Base de datos no disponible: %s", exc)
        return _body(503, "Servicio temporalmente no disponible, intenta de nuevo en unos segundos")

    @app.exception_handler(Exception)
    async def unhandled_exc(_: Request, exc: Exception):
        log.exception("Error no controlado")
        return _body(500, "Error interno del servidor")

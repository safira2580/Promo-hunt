"""Manejadores globales: ninguna excepción se filtra como traza ni sin formato."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import DataError, IntegrityError, OperationalError

from app.main import app


class _Orig(Exception):
    def __init__(self, pgcode):
        self.pgcode = pgcode


def _ruta_que_lanza(exc: Exception):
    def _f():
        raise exc

    return _f


@pytest.mark.parametrize(
    ("exc", "estado"),
    [
        (IntegrityError("x", {}, _Orig("23503")), 409),
        (IntegrityError("x", {}, _Orig("23505")), 409),
        (IntegrityError("x", {}, _Orig("23514")), 409),
        (IntegrityError("x", {}, _Orig("23502")), 409),
        (IntegrityError("x", {}, _Orig("99999")), 409),
        (DataError("x", {}, _Orig("22P02")), 422),
        (OperationalError("x", {}, _Orig("08006")), 503),
        (RuntimeError("secreto interno: password=123"), 500),
    ],
)
def test_excepciones_se_traducen_a_respuestas_controladas(exc, estado):
    app.add_api_route("/__boom", _ruta_que_lanza(exc), methods=["GET"])
    try:
        with TestClient(app, raise_server_exceptions=False) as c:
            r = c.get("/__boom")
    finally:
        app.router.routes.pop()
    assert r.status_code == estado
    cuerpo = r.json()
    assert cuerpo["ok"] is False and cuerpo["mensaje"]
    assert "secreto interno" not in r.text  # nunca se filtra el detalle de errores internos

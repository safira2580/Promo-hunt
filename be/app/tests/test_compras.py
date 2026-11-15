"""Compras, validación de pago y biblioteca."""

from decimal import Decimal

import pytest
from sqlalchemy import text

from app.models.game import Categoria, Descuento, Juego, Plataforma
from app.routers import compras as compras_router
from app.tests.conftest import _crear_y_loguear


@pytest.fixture
def oferta(db):
    cat = Categoria(nombre="Acción")
    plat = Plataforma(nombre="Steam")
    db.add_all([cat, plat])
    db.flush()
    juego = Juego(nombre="Forza Horizon", id_categoria=cat.id_categoria)
    db.add(juego)
    db.flush()
    desc = Descuento(
        id_juego=juego.id_juego,
        id_plataforma=plat.id_plataforma,
        precio_original=Decimal("100"),
        precio_descuento=Decimal("50"),
        porcentaje_descuento=Decimal("50"),
        ahorro=Decimal("50"),
        estado="Activo",
    )
    db.add(desc)
    db.commit()
    return {"id_descuento": desc.id_descuento, "id_juego": juego.id_juego}


def _comprar(client, headers, oferta, **extra):
    return client.post(
        "/api/v1/compras", json={"id_descuento": oferta["id_descuento"], **extra}, headers=headers
    )


def test_endpoints_exigen_sesion(client):
    assert client.post("/api/v1/compras", json={"id_descuento": 1}).status_code == 401
    assert client.post("/api/v1/compras/1/pago", json={}).status_code == 401
    assert client.get("/api/v1/compras/1").status_code == 401
    assert client.get("/api/v1/biblioteca").status_code == 401


def test_el_servidor_fija_el_precio(client, user_h, oferta):
    r = _comprar(client, user_h, oferta, monto=0.01)  # el cliente intenta pagar 1 centavo
    assert r.status_code == 201
    assert r.json()["monto"] == 50.0
    assert r.json()["estado"] == "pendiente"
    assert r.json()["referencia"].startswith("PH-")


def test_oferta_inexistente_o_inactiva(client, user_h, db, oferta):
    assert (
        client.post("/api/v1/compras", json={"id_descuento": 999}, headers=user_h).status_code
        == 404
    )
    db.execute(text("UPDATE descuento SET estado = 'Inactivo'"))
    db.commit()
    assert _comprar(client, user_h, oferta).status_code == 404


def test_pendiente_no_da_acceso_hasta_pagar(client, user_h, oferta):
    _comprar(client, user_h, oferta)
    assert client.get("/api/v1/biblioteca", headers=user_h).json() == []


def test_pago_aprobado_agrega_a_biblioteca_y_cuenta_la_venta(client, user_h, db, oferta):
    id_compra = _comprar(client, user_h, oferta).json()["id_compra"]
    r = client.post(
        f"/api/v1/compras/{id_compra}/pago", json={"resultado": "aprobado"}, headers=user_h
    )
    assert r.status_code == 200 and r.json()["estado"] == "pagada"

    lib = client.get("/api/v1/biblioteca", headers=user_h).json()
    assert [j["id_juego"] for j in lib] == [oferta["id_juego"]]
    assert lib[0]["precio_pagado"] == 50.0
    venta = db.execute(text("SELECT copias_vendidas, ingresos FROM venta")).one()
    assert venta.copias_vendidas == 1 and venta.ingresos == Decimal("50")


def test_pagar_dos_veces_es_idempotente(client, user_h, db, oferta):
    id_compra = _comprar(client, user_h, oferta).json()["id_compra"]
    for _ in range(2):
        r = client.post(f"/api/v1/compras/{id_compra}/pago", json={}, headers=user_h)
        assert r.status_code == 200
    assert db.execute(text("SELECT copias_vendidas FROM venta")).scalar_one() == 1


def test_pago_rechazado_no_da_acceso_y_permite_reintentar(client, user_h, oferta):
    id_compra = _comprar(client, user_h, oferta).json()["id_compra"]
    r = client.post(
        f"/api/v1/compras/{id_compra}/pago", json={"resultado": "rechazado"}, headers=user_h
    )
    assert r.json()["estado"] == "rechazada"
    assert client.get("/api/v1/biblioteca", headers=user_h).json() == []
    # una compra rechazada no se puede "aprobar" después
    assert (
        client.post(f"/api/v1/compras/{id_compra}/pago", json={}, headers=user_h).status_code == 409
    )
    # pero sí se puede iniciar una nueva
    nueva = _comprar(client, user_h, oferta)
    assert nueva.status_code == 201 and nueva.json()["id_compra"] != id_compra


def test_no_se_compra_dos_veces_el_mismo_juego(client, user_h, oferta):
    id_compra = _comprar(client, user_h, oferta).json()["id_compra"]
    client.post(f"/api/v1/compras/{id_compra}/pago", json={}, headers=user_h)
    assert _comprar(client, user_h, oferta).status_code == 409


def test_compra_pendiente_se_reutiliza_con_precio_vigente(client, user_h, db, oferta):
    primera = _comprar(client, user_h, oferta).json()
    db.execute(text("UPDATE descuento SET precio_descuento = 40"))
    db.commit()
    segunda = _comprar(client, user_h, oferta).json()
    assert segunda["id_compra"] == primera["id_compra"]
    assert segunda["referencia"] == primera["referencia"]
    assert segunda["monto"] == 40.0


def test_otro_usuario_no_ve_ni_paga_mi_compra(client, db, user_h, oferta):
    id_compra = _comprar(client, user_h, oferta).json()["id_compra"]
    otro = _crear_y_loguear(client, db, "otro@promohunt-tests.com", "user")
    assert client.get(f"/api/v1/compras/{id_compra}", headers=otro).status_code == 404
    assert (
        client.post(f"/api/v1/compras/{id_compra}/pago", json={}, headers=otro).status_code == 404
    )
    assert client.get("/api/v1/biblioteca", headers=otro).json() == []


def test_resultado_invalido_422(client, user_h, oferta):
    id_compra = _comprar(client, user_h, oferta).json()["id_compra"]
    r = client.post(
        f"/api/v1/compras/{id_compra}/pago", json={"resultado": "gratis"}, headers=user_h
    )
    assert r.status_code == 422


def test_pagos_desactivados_501(client, user_h, oferta, monkeypatch):
    id_compra = _comprar(client, user_h, oferta).json()["id_compra"]
    monkeypatch.setattr(compras_router.settings, "PAYMENTS_MODE", "desactivado")
    assert (
        client.post(f"/api/v1/compras/{id_compra}/pago", json={}, headers=user_h).status_code == 501
    )
    assert client.get("/api/v1/biblioteca", headers=user_h).json() == []

from decimal import Decimal

import pytest

from app.models.game import Categoria, Descuento, Juego, Plataforma


@pytest.fixture
def catalogo(db):
    cat = Categoria(nombre="Acción")
    plat = Plataforma(nombre="Steam")
    db.add_all([cat, plat])
    db.flush()
    j1 = Juego(nombre="Forza Horizon", id_categoria=cat.id_categoria)
    j2 = Juego(nombre="GTA 100%_Edition", id_categoria=None)
    j3 = Juego(nombre="Sin oferta", id_categoria=cat.id_categoria)
    db.add_all([j1, j2, j3])
    db.flush()
    db.add_all(
        [
            Descuento(
                id_juego=j1.id_juego,
                id_plataforma=plat.id_plataforma,
                precio_original=Decimal("100"),
                precio_descuento=Decimal("50"),
                porcentaje_descuento=Decimal("50"),
                ahorro=Decimal("50"),
                estado="Activo",
            ),
            Descuento(
                id_juego=j2.id_juego,
                id_plataforma=plat.id_plataforma,
                precio_original=Decimal("80"),
                precio_descuento=Decimal("20"),
                porcentaje_descuento=Decimal("75"),
                ahorro=Decimal("60"),
                estado="Activo",
            ),
            Descuento(
                id_juego=j3.id_juego,
                id_plataforma=plat.id_plataforma,
                precio_original=Decimal("10"),
                precio_descuento=Decimal("5"),
                porcentaje_descuento=Decimal("50"),
                ahorro=Decimal("5"),
                estado="Inactivo",
            ),
        ]
    )
    db.commit()
    yield {"cat": cat, "j1": j1, "j2": j2}
    db.query(Descuento).delete()
    db.query(Juego).delete()
    db.query(Plataforma).delete()
    db.query(Categoria).delete()
    db.commit()


def test_listado_solo_activos_ordenado_por_descuento(client, catalogo):
    r = client.get("/api/v1/juegos")
    assert r.status_code == 200
    nombres = [j["nombre"] for j in r.json()]
    assert nombres == ["GTA 100%_Edition", "Forza Horizon"]  # 75% antes que 50%; sin inactivos


def test_filtro_por_categoria(client, catalogo):
    r = client.get("/api/v1/juegos", params={"categoria": catalogo["cat"].id_categoria})
    assert [j["nombre"] for j in r.json()] == ["Forza Horizon"]


def test_busqueda_por_nombre_insensible_a_mayusculas(client, catalogo):
    r = client.get("/api/v1/juegos", params={"buscar": "forza"})
    assert [j["nombre"] for j in r.json()] == ["Forza Horizon"]


def test_busqueda_trata_comodines_como_literales(client, catalogo):
    assert len(client.get("/api/v1/juegos", params={"buscar": "%"}).json()) == 1  # solo "100%"
    assert len(client.get("/api/v1/juegos", params={"buscar": "_"}).json()) == 1  # solo "_Edition"


def test_busqueda_con_inyeccion_sql_no_rompe(client, catalogo):
    r = client.get("/api/v1/juegos", params={"buscar": "'; DROP TABLE juego; --"})
    assert r.status_code == 200 and r.json() == []
    assert len(client.get("/api/v1/juegos").json()) == 2


def test_detalle_ok(client, catalogo):
    r = client.get(f"/api/v1/juegos/{catalogo['j1'].id_juego}")
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True and data["juego"]["nombre"] == "Forza Horizon"
    assert len(data["descuentos"]) == 1


def test_detalle_inexistente_404(client):
    assert client.get("/api/v1/juegos/999999").status_code == 404


def test_categorias(client, catalogo):
    r = client.get("/api/v1/categorias")
    assert r.status_code == 200 and r.json()[0]["nombre"] == "Acción"


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/health/ready").json() == {"status": "ready"}

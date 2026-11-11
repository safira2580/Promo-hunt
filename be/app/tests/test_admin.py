"""Roles y permisos, CRUD de administración, validaciones e integridad referencial."""

import pytest

A = "/api/v1/admin"


# ---------------------------------------------------------------- roles y permisos
@pytest.mark.parametrize(
    "recurso", ["juegos", "descuentos", "desarrolladores", "generos", "categoria", "resenas"]
)
def test_admin_sin_token_401(client, recurso):
    assert client.get(f"{A}/{recurso}").status_code == 401


@pytest.mark.parametrize(
    "recurso", ["juegos", "descuentos", "desarrolladores", "generos", "categoria", "resenas"]
)
def test_admin_con_usuario_normal_403(client, user_h, recurso):
    r = client.get(f"{A}/{recurso}", headers=user_h)
    assert r.status_code == 403
    assert r.json()["ok"] is False


def test_usuario_normal_no_puede_escribir_ni_borrar(client, user_h):
    assert client.post(f"{A}/generos", json={"nombre": "X"}, headers=user_h).status_code == 403
    assert client.put(f"{A}/generos/1", json={"nombre": "X"}, headers=user_h).status_code == 403
    assert client.delete(f"{A}/generos/1", headers=user_h).status_code == 403


def test_token_falso_401(client):
    r = client.get(f"{A}/juegos", headers={"Authorization": "Bearer abc.def.ghi"})
    assert r.status_code == 401


def test_refresh_token_no_sirve_como_access(client, db):
    from app.models.user import User
    from app.utils.security import create_refresh_token, hash_password

    u = User(
        nombre="Adm",
        correo="a2@promohunt-tests.com",
        contrasena=hash_password("x12345"),
        rol="admin",
    )
    db.add(u)
    db.commit()
    r = client.get(
        f"{A}/juegos", headers={"Authorization": f"Bearer {create_refresh_token(u.id_usuario)}"}
    )
    assert r.status_code == 401


# ---------------------------------------------------------------- CRUD
def test_crud_juego_completo(client, admin_h):
    r = client.post(
        f"{A}/juegos",
        headers=admin_h,
        json={"nombre": "Nuevo", "fecha_lanzamiento": "", "edad_minima": "", "id_categoria": None},
    )
    assert r.status_code == 201, r.text
    jid = r.json()["id_juego"]

    lista = client.get(f"{A}/juegos", headers=admin_h).json()
    assert lista["ok"] and [j["nombre"] for j in lista["juegos"]] == ["Nuevo"]

    r = client.put(f"{A}/juegos/{jid}", headers=admin_h, json={"descripcion": "desc"})
    assert r.status_code == 200
    j = client.get(f"{A}/juegos", headers=admin_h).json()["juegos"][0]
    assert j["descripcion"] == "desc" and j["nombre"] == "Nuevo"  # PUT parcial no borra el resto

    assert client.delete(f"{A}/juegos/{jid}", headers=admin_h).status_code == 200
    assert client.get(f"{A}/juegos", headers=admin_h).json()["juegos"] == []


def test_404_en_editar_y_eliminar_inexistentes(client, admin_h):
    assert client.put(f"{A}/juegos/999", headers=admin_h, json={"nombre": "x"}).status_code == 404
    assert client.delete(f"{A}/categoria/999", headers=admin_h).status_code == 404


def test_validacion_campo_obligatorio_422(client, admin_h):
    r = client.post(f"{A}/juegos", headers=admin_h, json={"descripcion": "sin nombre"})
    assert r.status_code == 422 and "nombre" in r.json()["mensaje"].lower()


def test_validacion_edad_y_calificacion_fuera_de_rango(client, admin_h):
    assert (
        client.post(
            f"{A}/juegos", headers=admin_h, json={"nombre": "x", "edad_minima": 99}
        ).status_code
        == 422
    )


def test_columnas_no_permitidas_se_ignoran(client, admin_h):
    r = client.post(
        f"{A}/generos",
        headers=admin_h,
        json={"nombre": "Rol", "id_genero": 777, "descripcion; DROP TABLE x": "1"},
    )
    assert r.status_code == 201
    assert r.json()["id_genero"] != 777


# ---------------------------------------------------------------- descuentos (reglas de negocio)
@pytest.fixture
def juego_y_plataforma(client, admin_h, db):
    from app.models.game import Plataforma

    jid = client.post(f"{A}/juegos", headers=admin_h, json={"nombre": "G"}).json()["id_juego"]
    p = Plataforma(nombre="Steam")
    db.add(p)
    db.commit()
    return jid, p.id_plataforma


def test_descuento_calcula_porcentaje_y_ahorro(client, admin_h, juego_y_plataforma):
    jid, pid = juego_y_plataforma
    r = client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={
            "id_juego": jid,
            "id_plataforma": pid,
            "precio_original": 100,
            "precio_descuento": 60,
            "estado": "Activo",
            "fecha_inicio": "",
            "fecha_fin": "",
        },
    )
    assert r.status_code == 201, r.text
    d = client.get(f"{A}/descuentos", headers=admin_h).json()["descuentos"][0]
    assert float(d["porcentaje_descuento"]) == 40.0 and float(d["ahorro"]) == 40.0
    assert d["juego"] == "G" and d["plataforma"] == "Steam"


def test_descuento_precio_mayor_rechazado(client, admin_h, juego_y_plataforma):
    jid, pid = juego_y_plataforma
    r = client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={"id_juego": jid, "id_plataforma": pid, "precio_original": 10, "precio_descuento": 50},
    )
    assert r.status_code == 422


def test_descuento_fechas_invertidas_rechazadas_con_zona_horaria(
    client, admin_h, juego_y_plataforma
):
    jid, pid = juego_y_plataforma
    r = client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={
            "id_juego": jid,
            "id_plataforma": pid,
            "precio_original": 10,
            "precio_descuento": 5,
            "fecha_inicio": "2026-06-10T00:00:00Z",
            "fecha_fin": "2026-06-01T00:00:00",
        },
    )
    assert r.status_code == 422  # y NO 500 por mezclar fechas con y sin zona


def test_descuento_estado_invalido_422(client, admin_h, juego_y_plataforma):
    jid, pid = juego_y_plataforma
    r = client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={
            "id_juego": jid,
            "id_plataforma": pid,
            "precio_original": 10,
            "precio_descuento": 5,
            "estado": "Inventado",
        },
    )
    assert r.status_code == 422


def test_editar_descuento_valida_contra_valores_existentes(client, admin_h, juego_y_plataforma):
    jid, pid = juego_y_plataforma
    did = client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={
            "id_juego": jid,
            "id_plataforma": pid,
            "precio_original": 100,
            "precio_descuento": 50,
        },
    ).json()["id_descuento"]
    # solo cambia el precio descuento a algo mayor que el original almacenado
    assert (
        client.put(
            f"{A}/descuentos/{did}", headers=admin_h, json={"precio_descuento": 150}
        ).status_code
        == 422
    )


# ----------------------------------- integridad referencial → 409, nunca 500
def test_fk_inexistente_devuelve_409(client, admin_h, juego_y_plataforma):
    _, pid = juego_y_plataforma
    r = client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={
            "id_juego": 99999,
            "id_plataforma": pid,
            "precio_original": 10,
            "precio_descuento": 5,
        },
    )
    assert r.status_code == 409 and r.json()["ok"] is False


def test_borrar_plataforma_con_descuentos_restringido_409(client, admin_h, juego_y_plataforma, db):
    jid, pid = juego_y_plataforma
    client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={"id_juego": jid, "id_plataforma": pid, "precio_original": 10, "precio_descuento": 5},
    )
    from sqlalchemy import text
    from sqlalchemy.exc import IntegrityError

    with pytest.raises(IntegrityError):
        db.execute(text("DELETE FROM plataforma WHERE id_plataforma = :p"), {"p": pid})
    db.rollback()


def test_borrar_juego_en_cascada_elimina_sus_descuentos(client, admin_h, juego_y_plataforma, db):
    from sqlalchemy import text

    jid, pid = juego_y_plataforma
    client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={"id_juego": jid, "id_plataforma": pid, "precio_original": 10, "precio_descuento": 5},
    )
    assert client.delete(f"{A}/juegos/{jid}", headers=admin_h).status_code == 200
    assert db.execute(text("SELECT count(*) FROM descuento")).scalar() == 0


def test_borrar_categoria_deja_juegos_sin_categoria_set_null(client, admin_h):
    cid = client.post(f"{A}/categoria", headers=admin_h, json={"nombre": "Acción"}).json()[
        "id_categoria"
    ]
    client.post(f"{A}/juegos", headers=admin_h, json={"nombre": "J", "id_categoria": cid})
    assert client.delete(f"{A}/categoria/{cid}", headers=admin_h).status_code == 200
    assert client.get(f"{A}/juegos", headers=admin_h).json()["juegos"][0]["id_categoria"] is None


def test_resena_duplicada_409_y_calificacion_invalida_422(client, admin_h, db):
    from app.models.user import User

    u = db.query(User).filter(User.correo == "admin@promohunt-tests.com").one()
    jid = client.post(f"{A}/juegos", headers=admin_h, json={"nombre": "J"}).json()["id_juego"]
    body = {
        "id_usuario": u.id_usuario,
        "id_juego": jid,
        "titulo": "t",
        "comentario": "c",
        "calificacion": 5,
    }
    assert client.post(f"{A}/resenas", headers=admin_h, json=body).status_code == 201
    assert client.post(f"{A}/resenas", headers=admin_h, json=body).status_code == 409
    assert (
        client.post(f"{A}/resenas", headers=admin_h, json={**body, "calificacion": 6}).status_code
        == 422
    )


def test_check_en_bd_impide_rol_invalido(db):
    from sqlalchemy import text
    from sqlalchemy.exc import IntegrityError

    with pytest.raises(IntegrityError):
        db.execute(
            text(
                "INSERT INTO usuario (nombre, correo, contrasena, rol) "
                "VALUES ('ab','z@z.com','x','superman')"
            )
        )
    db.rollback()


# ---------------------------------------------------------------- formato uniforme de errores
def test_error_404_ruta_inexistente_tiene_formato_comun(client):
    j = client.get("/api/v1/no-existe").json()
    assert j["ok"] is False and "mensaje" in j and "detail" in j


def test_json_malformado_no_es_500(client, admin_h):
    r = client.post(
        f"{A}/juegos",
        headers={**admin_h, "content-type": "application/json"},
        content="{no es json",
    )
    assert r.status_code == 422


# ---------------------------------------------------------------- perfil
def test_perfil_y_edicion(client, user_h):
    p = client.get("/api/v1/usuario/perfil", headers=user_h).json()
    assert (
        p["logueado"] is True and p["usuario"]["rol"] == "user" and "contrasena" not in p["usuario"]
    )
    assert client.get("/api/v1/usuario/perfil").status_code == 401

    r = client.put(
        "/api/v1/usuario/editar",
        headers=user_h,
        json={"nombre": "Nuevo Nombre", "correo": "user@promohunt-tests.com"},
    )
    assert r.status_code == 200


def test_cambio_de_contrasena(client, user_h):
    base = {"nombre": "Usuario user", "correo": "user@promohunt-tests.com"}
    # sin actual
    assert (
        client.put(
            "/api/v1/usuario/editar", headers=user_h, json={**base, "nueva_contrasena": "nueva123"}
        ).status_code
        == 422
    )
    # actual incorrecta
    assert (
        client.put(
            "/api/v1/usuario/editar",
            headers=user_h,
            json={**base, "contrasena_actual": "mala", "nueva_contrasena": "nueva123"},
        ).status_code
        == 400
    )
    # correcta
    assert (
        client.put(
            "/api/v1/usuario/editar",
            headers=user_h,
            json={**base, "contrasena_actual": "clave123", "nueva_contrasena": "nueva123"},
        ).status_code
        == 200
    )
    ok = client.post(
        "/api/v1/auth/login", json={"correo": base["correo"], "contrasena": "nueva123"}
    )
    assert ok.status_code == 200
    viejo = client.post(
        "/api/v1/auth/login", json={"correo": base["correo"], "contrasena": "clave123"}
    )
    assert viejo.status_code == 401


def test_editar_correo_ya_usado_409(client, user_h, admin_h):
    r = client.put(
        "/api/v1/usuario/editar",
        headers=user_h,
        json={"nombre": "Usuario user", "correo": "admin@promohunt-tests.com"},
    )
    assert r.status_code == 409


def test_porcentaje_y_ahorro_son_siempre_automaticos(client, admin_h, juego_y_plataforma):
    jid, pid = juego_y_plataforma
    # Aunque el cliente envíe valores manuales incorrectos, el servidor los recalcula
    r = client.post(
        f"{A}/descuentos",
        headers=admin_h,
        json={
            "id_juego": jid,
            "id_plataforma": pid,
            "precio_original": 60,
            "precio_descuento": 20,
            "porcentaje_descuento": 5,
            "ahorro": 1,
        },
    )
    assert r.status_code == 201, r.text
    did = r.json()["id_descuento"]
    d = client.get(f"{A}/descuentos", headers=admin_h).json()["descuentos"][0]
    assert float(d["porcentaje_descuento"]) == 66.67 and float(d["ahorro"]) == 40.0

    # Al editar solo un precio, se recalculan ambos con el valor almacenado del otro
    r = client.put(f"{A}/descuentos/{did}", headers=admin_h, json={"precio_descuento": 30})
    assert r.status_code == 200
    d = client.get(f"{A}/descuentos", headers=admin_h).json()["descuentos"][0]
    assert float(d["porcentaje_descuento"]) == 50.0 and float(d["ahorro"]) == 30.0

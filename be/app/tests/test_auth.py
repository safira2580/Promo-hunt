def test_register_and_login(client):
    payload = {
        "nombre": "Tester",
        "correo": "tester@promohunt-tests.com",
        "contrasena": "secreto123",
    }
    r = client.post("/api/v1/auth/register", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["correo"] == payload["correo"]
    assert "contrasena" not in data

    r2 = client.post(
        "/api/v1/auth/login",
        json={"correo": payload["correo"], "contrasena": payload["contrasena"]},
    )
    assert r2.status_code == 200
    tokens = r2.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"

    r3 = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert r3.status_code == 200
    assert r3.json()["correo"] == payload["correo"]


def test_login_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "nombre": "Otro",
            "correo": "otro@promohunt-tests.com",
            "contrasena": "correcta",
        },
    )
    r = client.post(
        "/api/v1/auth/login",
        json={"correo": "otro@promohunt-tests.com", "contrasena": "mala"},
    )
    assert r.status_code == 401


def test_me_without_token(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401


def test_verify_password_con_hash_invalido_no_lanza():
    from app.utils.security import verify_password

    assert verify_password("123456", "123456") is False  # texto plano legado
    assert verify_password("x", "") is False


def test_login_usuario_con_hash_legado_devuelve_401_no_500(client, db):
    from app.models.user import User

    db.add(
        User(
            nombre="Legado",
            correo="legado@promohunt-tests.com",
            contrasena="texto-plano",
            rol="user",
        )
    )
    db.commit()
    r = client.post(
        "/api/v1/auth/login",
        json={"correo": "legado@promohunt-tests.com", "contrasena": "texto-plano"},
    )
    assert r.status_code == 401


def test_login_con_correo_no_estandar_almacenado_no_rompe(client, db):
    from app.models.user import User
    from app.utils.security import hash_password

    db.add(
        User(
            nombre="Raro", correo="sadsad@asdasda", contrasena=hash_password("clave123"), rol="user"
        )
    )
    db.commit()
    r = client.post(
        "/api/v1/auth/login", json={"correo": "sadsad@asdasda", "contrasena": "clave123"}
    )
    assert r.status_code == 200
    assert r.json()["usuario"]["correo"] == "sadsad@asdasda"

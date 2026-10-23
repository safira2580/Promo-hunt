def test_register_and_login(client):
    payload = {
        "nombre": "Tester",
        "correo": "tester@promohunt.test",
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
            "correo": "otro@promohunt.test",
            "contrasena": "correcta",
        },
    )
    r = client.post(
        "/api/v1/auth/login",
        json={"correo": "otro@promohunt.test", "contrasena": "mala"},
    )
    assert r.status_code == 401


def test_me_without_token(client):
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 401

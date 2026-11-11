"""
Fixtures de pytest. Usa TEST_DATABASE_URL (db-test en puerto 5433).
"""

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Forzar BD de test antes de importar la app
os.environ.setdefault(
    "TEST_DATABASE_URL",
    "postgresql://promohunt:promohunt@localhost:5433/descuentos_juegos_test",
)
os.environ.setdefault("SECRET_KEY", "test-secret-key-minimo-32-caracteres-ok")

from app.config import get_settings
from app.database import get_db
from app.main import app

settings = get_settings()
SCHEMA = Path(__file__).resolve().parents[2] / "descuentos_juegos_postgres.sql"
MIGRATION = Path(__file__).resolve().parents[2] / "migrations" / "001_integridad_referencial.sql"


def _ejecutar_sql(eng, sql: str) -> None:
    raw = eng.raw_connection()  # DBAPI directo: el SQL contiene % de format()
    try:
        with raw.cursor() as cur:
            cur.execute(sql)
        raw.commit()
    finally:
        raw.close()


@pytest.fixture(scope="session")
def engine():
    url = settings.test_database_url_sync
    if ":5432/" in url:
        pytest.exit("TEST_DATABASE_URL no debe apuntar a la BD de desarrollo (5432)")
    eng = create_engine(url)
    # BD de test = esquema SQL oficial (sin datos semilla) + migración de integridad,
    # es decir, exactamente las mismas tablas y restricciones que en producción.
    esquema = SCHEMA.read_text(encoding="utf-8").split("INSERT INTO categoria")[0]
    _ejecutar_sql(eng, "DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
    _ejecutar_sql(eng, esquema)
    _ejecutar_sql(eng, MIGRATION.read_text(encoding="utf-8"))
    yield eng
    _ejecutar_sql(eng, "DROP SCHEMA public CASCADE; CREATE SCHEMA public;")


@pytest.fixture
def db(engine):
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def limpiar_tablas(engine):
    """Cada test arranca con las tablas vacías (aislamiento total)."""
    yield
    _ejecutar_sql(
        engine,
        "TRUNCATE usuario, categoria, genero, desarrollador, noticia, plataforma, juego, "
        "descuento, alerta, crossplay, historial_precios, resena, venta, wishlist "
        "RESTART IDENTITY CASCADE;",
    )


def _crear_y_loguear(client, db, correo: str, rol: str) -> dict:
    from app.models.user import User
    from app.utils.security import hash_password

    db.add(
        User(nombre=f"Usuario {rol}", correo=correo, contrasena=hash_password("clave123"), rol=rol)
    )
    db.commit()
    r = client.post("/api/v1/auth/login", json={"correo": correo, "contrasena": "clave123"})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def admin_h(client, db):
    return _crear_y_loguear(client, db, "admin@promohunt-tests.com", "admin")


@pytest.fixture
def user_h(client, db):
    return _crear_y_loguear(client, db, "user@promohunt-tests.com", "user")

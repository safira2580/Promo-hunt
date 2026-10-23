"""
Fixtures de pytest. Usa TEST_DATABASE_URL (db-test en puerto 5433).
"""

import os

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
from app.database import Base, get_db
from app.main import app

settings = get_settings()


@pytest.fixture(scope="session")
def engine():
    url = settings.TEST_DATABASE_URL
    if "5432" in url and "5433" not in url:
        pytest.exit("TEST_DATABASE_URL no debe apuntar a la BD de desarrollo (5432)")
    eng = create_engine(url)
    Base.metadata.create_all(bind=eng)
    yield eng
    Base.metadata.drop_all(bind=eng)


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

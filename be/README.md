# Backend — PromoHunt (FastAPI + PostgreSQL)

## Setup

```bash
# Desde la raíz del repo
docker compose up -d

cd be
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# o: uv sync

cp .env.example .env
# Editar SECRET_KEY si quieres

uvicorn app.main:app --reload
# → http://localhost:8000
# → Swagger: http://localhost:8000/docs
```

## Estructura

```
be/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models/
│   ├── schemas/
│   ├── routers/
│   ├── services/
│   ├── utils/
│   └── tests/
├── alembic/
├── pyproject.toml
└── requirements.txt
```

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | No | Registro (bcrypt) |
| POST | /api/v1/auth/login | No | Login → JWT |
| GET | /api/v1/auth/me | Bearer | Usuario actual |
| GET | /api/v1/juegos | No | Lista ofertas |
| GET | /api/v1/juegos/{id} | No | Detalle + descuentos |
| GET | /api/v1/categorias | No | Categorías |

## Tests

```bash
docker compose up -d db-test
pytest -v
```

## Cambios vs Flask anterior

- Flask → **FastAPI**
- Sesiones cookie → **JWT**
- Contraseñas en texto plano → **bcrypt**
- SQL suelto en rutas → **services + models/schemas**
- Sin tests → **pytest**
- Merge conflict en database.py → **eliminado**

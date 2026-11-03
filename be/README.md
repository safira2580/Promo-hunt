# Backend — PromoHunt (PostgreSQL)

Hay dos backends; ver el README de la raíz para el estado de cada uno.

## Setup común

```bash
# Desde la raíz del repo
docker compose up -d

cd be
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

## Flask (activo, lo usa el frontend)

```bash
python app.py
# -> http://localhost:5000
```

Rutas bajo `/api/...` (juegos, categorías, login, usuario, admin/*). Usa sesión por cookie.

## FastAPI (en migración)

```bash
uvicorn app.main:app --reload
# -> http://localhost:8000
# -> Swagger: http://localhost:8000/docs
```

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | No | Registro (bcrypt) |
| POST | /api/v1/auth/login | No | Login → JWT |
| GET | /api/v1/auth/me | Bearer | Usuario actual |
| GET | /api/v1/juegos | No | Lista ofertas |
| GET | /api/v1/juegos/{id} | No | Detalle + descuentos |
| GET | /api/v1/categorias | No | Categorías |

Pendiente de migrar: perfil, panel admin (juegos, descuentos, desarrolladores, géneros, categorías, reseñas).

## Tests (FastAPI)

```bash
docker compose up -d db-test
pytest -v
```

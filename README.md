# 🎮 PromoHunt

> Proyecto educativo | 2026
> Plataforma web de descuentos y ofertas en videojuegos.

## Estado del backend

El proyecto tiene **dos backends** en `be/`:

| Backend | Ubicación | Puerto | Estado |
|---|---|---|---|
| **Flask** | `be/app.py` | 5000 | **Activo.** Es el que usa el frontend (`fe/`): login, perfil, panel admin y catálogo. |
| **FastAPI** | `be/app/` | 8000 | **En migración.** Solo tiene auth (JWT + bcrypt) y juegos/categorías bajo `/api/v1`. |

Mientras la migración no esté completa, el frontend debe seguir apuntando a Flask.

## Stack

| Capa | Tecnologías |
|---|---|
| Backend activo | Python 3.12+, Flask, Flask-CORS, psycopg2 |
| Backend en migración | FastAPI, SQLAlchemy 2, Alembic, JWT, bcrypt |
| Frontend | React 19, TypeScript, Vite |
| Base de datos | PostgreSQL 17 (Docker Compose) |
| Email (dev) | Mailpit (`http://localhost:8025`) |
| Testing | pytest + httpx (FastAPI) |

## Prerrequisitos

- Python 3.12+
- Node.js 18+
- Docker + Docker Compose
- Git (en Windows, usa **Git Bash**)

## Instalación

```bash
# 1. Clonar
git clone https://github.com/safira2580/Promo-hunt.git
cd Promo-hunt

# 2. Infraestructura
docker compose up -d
# db :5432 | db-test :5433 | mailpit UI :8025

# 3. Backend
cd be
python3 -m venv .venv
source .venv/bin/activate      # Windows Git Bash: source .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env

python app.py                  # Flask  -> http://localhost:5000
# alternativa (migración):
# uvicorn app.main:app --reload   # FastAPI -> http://localhost:8000/docs

# 4. Frontend (otra terminal)
cd fe
npm install
npm run dev
# -> http://localhost:5173
```

## Estructura

```
Promo-hunt/
├── docker-compose.yml      # db + db-test + mailpit
├── BITACORA.md
├── README.md
├── assets/
├── docs/                   # requisitos, diagramas, actas, presentaciones
├── be/
│   ├── app.py              # Flask (activo)
│   ├── database.py         # conexión psycopg2 (Flask)
│   ├── descuentos_juegos_postgres.sql
│   ├── requirements.txt
│   └── app/                # FastAPI (en migración): routers, services, models, schemas, tests
└── fe/                     # React + Vite
```

## Documentación

- [BITACORA.md](BITACORA.md)
- [Arquitectura](docs/referencia-tecnica/architecture.md)
- [Endpoints](docs/referencia-tecnica/api-endpoints.md)
- [Backend README](be/README.md)
- Carpeta `docs/` (requisitos, diagramas, presentaciones)

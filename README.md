# 🎮 PromoHunt

<<<<<<< HEAD
> Proyecto educativo | 2026  
> Plataforma de descuentos y ofertas en videojuegos

## Stack (alineado a buenas prácticas)

| Capa | Tecnologías |
|------|-------------|
| **Backend** | Python 3.12+, **FastAPI**, SQLAlchemy 2, Alembic, JWT, bcrypt |
| **Frontend** | React + TypeScript + Vite (tu `fe/` actual) |
| **Base de datos** | PostgreSQL 17 (Docker) |
| **Email (dev)** | Mailpit (`http://localhost:8025`) |
| **Testing** | pytest + httpx |

## Prerrequisitos

- Python 3.12+
- Node.js 18+
- Docker + Docker Compose
- Git Bash en Windows
=======
> Proyecto educativo | 2026

Plataforma web de descuentos y ofertas en videojuegos.

## Stack

| Capa | Tecnologías |
|------|-------------|
| **Backend** | Python, Flask, Flask-CORS, psycopg2 |
| **Frontend** | React 19, TypeScript, Vite |
| **Base de datos** | PostgreSQL 17 (Docker Compose) |

## Prerrequisitos

- Python 3.10+
- Node.js 18+
- Docker + Docker Compose
- Git

> Windows: usa **Git Bash**.
>>>>>>> 1bbdc2b537ebff5efa47f4a78fb85b869405ecb8

## Instalación

```bash
<<<<<<< HEAD
git clone <tu-repo>
cd PromoHunt

# 1. Infra
docker compose up -d
# db :5432 | db-test :5433 | mailpit UI :8025

# 2. Backend
=======
# 1. Clonar
git clone <url>
cd PromoHunt

# 2. Base de datos
docker compose up -d

# 3. Backend
>>>>>>> 1bbdc2b537ebff5efa47f4a78fb85b869405ecb8
cd be
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
<<<<<<< HEAD
uvicorn app.main:app --reload
# → http://localhost:8000/docs

# 3. Frontend (otra terminal)
cd fe
npm install   # o pnpm install
=======
python app.py
# → http://localhost:5000

# 4. Frontend (otra terminal)
cd fe
npm install
>>>>>>> 1bbdc2b537ebff5efa47f4a78fb85b869405ecb8
npm run dev
# → http://localhost:5173
```

## Estructura

```
PromoHunt/
<<<<<<< HEAD
├── docker-compose.yml      # db + db-test + mailpit
├── BITACORA.md             # Checklist de aprendizaje
├── README.md
├── docs/
│   └── referencia-tecnica/
├── be/                     # FastAPI (capas)
│   └── app/
│       ├── main.py
│       ├── models/
│       ├── schemas/
│       ├── routers/
│       ├── services/
│       ├── utils/
│       └── tests/
└── fe/                     # React (copia tu frontend actual)
```

## Cambios respecto a la versión Flask

1. **Backend Flask → FastAPI** con capas (routers / services / models / schemas)
2. **Auth por sesión → JWT** (access + refresh)
3. **Contraseñas en texto plano → bcrypt**
4. **docker-compose**: + `db-test` y `mailpit`
5. **Tests** con pytest
6. **BITACORA.md** y docs de arquitectura/API
7. Corregido **merge conflict** en el antiguo `database.py`
8. Prefijo de API: `/api/v1/...` (Swagger en `/docs`)

## Frontend

Copia la carpeta `fe/` de tu repo original.  
Actualiza las llamadas API de `/api/...` a `/api/v1/...` y el login para usar `Authorization: Bearer <token>` en lugar de cookies de sesión.

## Documentación

- [BITACORA.md](./BITACORA.md) — checklist obligatorio
- [Arquitectura](./docs/referencia-tecnica/architecture.md)
- [Endpoints](./docs/referencia-tecnica/api-endpoints.md)
- [Backend README](./be/README.md)
=======
├── docker-compose.yml
├── .gitignore
├── README.md
├── assets/
├── docs/
│   ├── DOCUMENTACION.md
│   ├── requisitos/
│   ├── diagramas/
│   ├── presentaciones/
│   ├── actas/
│   └── glosario/
├── be/                    # Backend Flask
│   ├── app.py
│   ├── database.py
│   ├── requirements.txt
│   ├── descuentos_juegos_postgres.sql
│   └── .env.example
└── fe/                    # Frontend React
    ├── src/
    └── package.json
```

## Documentación

Ver carpeta `docs/`.
>>>>>>> 1bbdc2b537ebff5efa47f4a78fb85b869405ecb8

# 🎮 PromoHunt

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

## Instalación

```bash
# 1. Clonar
git clone <url>
cd PromoHunt

# 2. Base de datos
docker compose up -d

# 3. Backend
cd be
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
# → http://localhost:5000

# 4. Frontend (otra terminal)
cd fe
npm install
npm run dev
# → http://localhost:5173
```

## Estructura

```
PromoHunt/
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

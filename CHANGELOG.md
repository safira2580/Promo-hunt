# Changelog — Alineación con proyecto de referencia FastAPI

## [1.0.0-aligned] — 2026-10-23

### Añadido
- Backend FastAPI con arquitectura en capas (models, schemas, routers, services, utils, tests)
- Auth JWT (register, login, /me) con bcrypt
- Alembic preparado (`alembic/` + `env.py`)
- docker-compose: servicios `db-test` (5433) y `mailpit` (8025)
- BITACORA.md (fases 0–6)
- docs/referencia-tecnica (architecture, api-endpoints)
- Tests pytest básicos de auth
- pyproject.toml + requirements.txt modernos

### Cambiado
- Flask → FastAPI
- Sesiones cookie → Bearer JWT
- Contraseñas texto plano → hash bcrypt
- Prefijo API `/api/...` → `/api/v1/...`
- Puerto backend por defecto 8000 (antes 5000)

### Corregido
- Merge conflict markers en el antiguo database.py

### Notas para el frontend
- Cambiar base URL a `http://localhost:8000`
- Login: guardar `access_token` y enviar header `Authorization: Bearer ...`
- Rutas: `/api/v1/juegos`, `/api/v1/categorias`, `/api/v1/auth/login`, etc.

### Pendiente (opcional)
- Migración Alembic formal de columnas `is_active` / `is_verified` sobre tabla usuario existente
- Email de verificación real vía Mailpit
- Rate limiting (slowapi ya en deps)
- E2E Playwright
- Copiar `fe/` completo desde el repo original

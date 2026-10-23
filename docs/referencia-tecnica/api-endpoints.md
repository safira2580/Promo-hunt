# API Endpoints — PromoHunt

Base: `http://localhost:8000`

## Auth

| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/v1/auth/register` | `{nombre, correo, contrasena}` | User 201 |
| POST | `/api/v1/auth/login` | `{correo, contrasena}` | tokens + usuario |
| GET | `/api/v1/auth/me` | Header Bearer | usuario |

## Juegos

| Método | Ruta | Query | Descripción |
|--------|------|-------|-------------|
| GET | `/api/v1/juegos` | `categoria` opcional | Lista ofertas activas |
| GET | `/api/v1/juegos/{id}` | — | Detalle + descuentos |
| GET | `/api/v1/categorias` | — | Categorías |

## Compatibilidad frontend

El FE anterior usaba `/api/juegos`. Ahora el prefijo es `/api/v1/...`.  
Actualiza las URLs del cliente o añade un router de compatibilidad si lo necesitas.

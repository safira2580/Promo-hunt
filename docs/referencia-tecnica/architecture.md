# Arquitectura — PromoHunt

## Capas

```
Cliente (React)  →  API (FastAPI)  →  PostgreSQL
                         │
              routers → services → models
                         │
                      utils (JWT, bcrypt)
```

| Capa | Responsabilidad |
|------|-----------------|
| **routers** | HTTP: rutas, status codes, Depends |
| **services** | Lógica de negocio |
| **models** | Tablas ORM (SQLAlchemy) |
| **schemas** | Validación entrada/salida (Pydantic) |
| **utils** | Seguridad, email, helpers |
| **dependencies** | `get_db`, `get_current_user` |

## Auth

1. Registro → password hasheado (bcrypt) → BD  
2. Login → verifica hash → emite access + refresh JWT  
3. Rutas protegidas → `Authorization: Bearer <access>` → `get_current_user`

## Dominio

Juegos, descuentos, plataformas, categorías (schema SQL existente + modelos ORM alineados).

# 🧭 Bitácora obligatoria — PromoHunt

> Checklist secuencial. Completa fase por fase en **tu propio repo**.
> El instructor verifica commits reales (`git log`), no solo texto.

Copia este archivo a tu repo y rellénalo con hashes de tus commits.

---

## Fase 0 — Entorno verificado

- [ ] `docker compose up -d` (db + mailpit + db-test)
- [ ] Backend: `uvicorn app.main:app --reload` en `:8000`
- [ ] Frontend: `npm run dev` / `pnpm dev` en `:5173`
- [ ] Login/registro o listado de juegos funciona
- [ ] Commit: `docs: bitácora fase 0` → hash: `___________`
- [ ] Captura adjunta en `docs/evidencia/`

## Fase 1 — Arquitectura propia

Lee `docs/referencia-tecnica/architecture.md` y el README del backend.

- [ ] Elige **un** endpoint y describe el flujo request → router → service → DB → response (10-15 líneas):

```
(tu respuesta aquí)
```

- [ ] Commit: `docs: bitácora fase 1` → hash: `___________`

## Fase 2 — Trazar login línea a línea

Sigue: FE login → `POST /api/v1/auth/login` → `auth_service` → `security.py` → JWT → `GET /me`.

- [ ] ¿Dónde se genera el JWT? ¿Dónde se valida?

```
(tu respuesta aquí)
```

- [ ] ¿Dónde se hashea el password y con qué algoritmo? ¿Por qué no texto plano?

```
(tu respuesta aquí)
```

- [ ] Commit: `docs: bitácora fase 2` → hash: `___________`

## Fase 3 — Modificar una regla de negocio real

Ejemplos: campo extra en User + migración Alembic; regla de validación en registro; expiración de token.

- [ ] RF / cambio: `___________`
- [ ] Commit con lógica real → hash: `___________`
- [ ] Explica qué cambiaste y por qué:

```
(tu respuesta aquí)
```

## Fase 4 — Dato real en el frontend

- [ ] Endpoint usado: `___________`
- [ ] Commit → hash: `___________`
- [ ] Captura del listado/detalle con datos de la API

## Fase 5 — Autoevaluación de seguridad (OWASP)

- [ ] ¿Tu cambio requiere auth? ¿Valida input? ¿Qué pasa con usuario sin permisos?

```
(tu respuesta aquí)
```

- [ ] Commit: `docs: bitácora fase 5` → hash: `___________`

## Fase 6 — Flujo GitHub (issue → rama → PR → merge)

En **tu** fork/repo:

- [ ] Issue `#______`
- [ ] Rama: `___________________________`
- [ ] PR `#______` con `Closes #N`
- [ ] Merge commit: `___________`

```
Qué revisaste en el diff:
```

# Documentación Técnica - PromoHunt

## 1. Descripción general

**PromoHunt** es una plataforma web orientada a la consulta y gestión de descuentos en videojuegos. El sistema permite a los usuarios explorar un catálogo de juegos, visualizar precios originales y con descuento, registrarse, iniciar sesión y administrar su perfil. Los administradores disponen de un panel completo para gestionar juegos, descuentos, desarrolladores y demás entidades.

La interfaz ha sido rediseñada con un enfoque **mobile-first** y estilo de aplicación nativa (barra de navegación inferior, tema oscuro, cards modernas).

---

## 2. Arquitectura del sistema

```
┌─────────────────────┐         ┌─────────────────────┐
│     Frontend        │         │      Backend        │
│  React + TypeScript │ ◄─────► │   Flask (Python)    │
│     (Vite)          │  HTTP   │                     │
│  localhost:5173     │         │  localhost:5000     │
└─────────────────────┘         └──────────┬──────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │   MySQL / MariaDB   │
                                │ descuentos_juegos   │
                                └─────────────────────┘
```

- **Frontend**: SPA (Single Page Application) con React Router.
- **Backend**: API REST con Flask.
- **Base de datos**: Relacional (MySQL).
- **Autenticación**: Sesiones con cookies (`promohunt_session`).

---

## 3. Módulos principales

### 3.1 Frontend (`frontend/`)

| Módulo              | Descripción                                      |
|---------------------|--------------------------------------------------|
| Header              | Logo, buscador y acceso a perfil                 |
| Banner              | Sección principal de bienvenida                  |
| Categories          | Categorías de juegos                             |
| Products            | Listado de juegos con descuento                  |
| ProductCard         | Tarjeta individual de juego                      |
| Blogs               | Noticias relacionadas con videojuegos            |
| BottomNav           | Navegación inferior estilo app                   |
| Login / Registro    | Autenticación de usuarios                        |
| Perfil              | Información y edición del usuario                |
| JuegoDetalle        | Página de detalle de un juego                    |
| Admin               | Panel de administración                          |

### 3.2 Backend (`backend/`)

Principales endpoints:

| Método | Ruta                              | Descripción                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/juegos`                     | Listar todos los juegos            |
| GET    | `/api/juegos/<id>`                | Detalle de un juego                |
| POST   | `/api/login`                      | Iniciar sesión                     |
| POST   | `/api/registrate`                 | Registrar nuevo usuario            |
| GET    | `/api/usuario/me`                 | Usuario actual (sesión)            |
| GET    | `/api/usuario/perfil`             | Datos del perfil                   |
| PUT    | `/api/usuario/editar`             | Editar perfil                      |
| POST   | `/api/logout`                     | Cerrar sesión                      |
| GET    | `/api/admin/juegos`               | Admin: listar juegos               |
| POST   | `/api/admin/juegos`               | Admin: crear juego                 |
| PUT    | `/api/admin/juegos/<id>`          | Admin: editar juego                |
| DELETE | `/api/admin/juegos/<id>`          | Admin: eliminar juego              |
| ...    | `/api/admin/descuentos`           | CRUD de descuentos                 |
| ...    | `/api/admin/desarrolladores`      | CRUD de desarrolladores            |

---

## 4. Base de datos

Base de datos: **`descuentos_juegos`**

### Tablas principales

| Tabla              | Descripción                              |
|--------------------|------------------------------------------|
| `usuario`          | Usuarios del sistema (clientes y admin)  |
| `juego`            | Catálogo de videojuegos                  |
| `descuento`        | Descuentos aplicados a los juegos        |
| `categoria`        | Categorías de juegos                     |
| `genero`           | Géneros                                  |
| `desarrollador`    | Empresas desarrolladoras                 |
| `plataforma`       | Plataformas (PC, Xbox, PlayStation...)   |
| `resena`           | Reseñas de usuarios                      |
| `wishlist`         | Lista de deseos                          |
| `alerta`           | Alertas de precio                        |
| `historial_precios`| Historial de cambios de precio           |
| `noticia`          | Noticias / blogs                         |
| `venta`            | Registro de ventas                       |
| `crossplay`        | Información de crossplay                 |

El archivo completo de la base de datos se encuentra en:

```
descuentos_juegos.sql
```

---

## 5. Instalación paso a paso

### 5.1 Base de datos

1. Inicia **MySQL** (XAMPP / WAMP / Laragon).
2. Abre phpMyAdmin → `http://localhost/phpmyadmin`
3. Crea la base de datos `descuentos_juegos`.
4. Importa el archivo `descuentos_juegos.sql`.

### 5.2 Backend

```bash
cd backend
pip install flask flask-cors mysql-connector-python
python app.py
```

Verifica que aparezca el mensaje:
```
✅ Conexión a MySQL exitosa
```

### 5.3 Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre el navegador en: **http://localhost:5173**

---

## 6. Manual de usuario (resumen)

### Usuario normal
1. Explorar juegos desde la página de inicio.
2. Usar el buscador del header.
3. Registrarse o iniciar sesión.
4. Ver el detalle de un juego.
5. Acceder a su perfil desde la barra inferior.

### Administrador
1. Iniciar sesión con cuenta de administrador.
2. Ir a la ruta `/admin`.
3. Gestionar juegos, descuentos, desarrolladores, géneros, etc.

---

## 7. Decisiones de diseño (versión actual)

- Se eliminó el menú de navegación clásico y el footer tradicional.
- Se implementó una **barra de navegación inferior** fija (estilo aplicación móvil).
- Se adoptó un **tema oscuro** moderno.
- Se eliminaron imágenes que no correspondían al dominio de videojuegos.
- Se añadió soporte básico de **PWA** (manifest.json + meta tags).
- El logo original del proyecto se mantuvo.

---

## 8. Posibles mejoras futuras

- Implementar carrito de compras y proceso de pago.
- Sistema real de wishlist y alertas de precio.
- Subida de imágenes de juegos desde el panel admin.
- Autenticación con JWT (además de sesiones).
- Despliegue en producción (Vercel + Railway / Render).
- Modo claro / oscuro conmutable.
- Notificaciones push (PWA completa).

---

## 9. Contacto / Autor

Proyecto académico desarrollado como aplicación de descuentos en videojuegos.  
Año: 2026

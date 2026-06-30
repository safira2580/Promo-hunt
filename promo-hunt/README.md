# 🎮 Promo Hunt

¡Caza las mejores ofertas de videojuegos en tiempo real! **Promo Hunt** es una aplicación diseñada para consolidar, gestionar y notificar a los usuarios sobre los descuentos más atractivos del mundo del gaming en distintas plataformas.

---


*   **Notificaciones en Tiempo Real:** Alertas instantáneas cuando un juego de tu lista de deseos baja de precio.
*   **Buscador Avanzado y Filtros:** Filtra ofertas por plataforma (PC, PlayStation, Xbox, Nintendo), porcentaje de descuento, tiendas o género.
*   **Historial de Precios:** Registro para saber si realmente estás ante el precio más bajo histórico.
*   **Panel de Administración:** Control total para gestionar el catálogo de juegos, tiendas vinculadas y monitoreo de ofertas.

---



El proyecto está construido utilizando tecnologías modernas y escalables para el desarrollo de software:

*   **Backend & API:** Python con el framework **FastAPI** (utilizando ruteadores modulares y programación asíncrona).
*   **Base de Datos:** Relacional (**MySQL / PostgreSQL**), estructurada con un robusto modelo entidad-relación para soportar usuarios, videojuegos, plataformas y el historial de ofertas.
*   **Diseño de UI/UX:** Figma (Prototipado móvil y flujos de usuario).
*   **Diagramación:** Draw.io (Diseño de arquitectura y modelo de datos).
*   **Metodología & Gestión:** Kanban (Gestión de Product Backlog, Casos de Uso Extendidos y Sprints mediante GitHub Projects).

---



El sistema cuenta con una arquitectura limpia basada en servicios y routers independientes para cada módulo de la API. El diseño de la base de datos está optimizado para consultas rápidas de precios y alertas.

> 💡 **Nota:** Para visualizar el diagrama de la base de datos, exporta tu diseño de Draw.io como imagen, guárdalo en la carpeta `docs/` y asegúrate de que el nombre coincida aquí abajo:

![Modelo Entidad-Relación](docs/diagrama_bd.png)

---

## 🚀 Instalación y Configuración (Local)

Para levantar el backend del proyecto en tu entorno de desarrollo, sigue estos pasos:

```bash
git clone [https://github.com/tu-usuario/promo-hunt.git](https://github.com/tu-usuario/promo-hunt.git)
cd promo-hunt

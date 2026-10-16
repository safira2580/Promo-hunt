import os
import psycopg2
from psycopg2.extras import RealDictCursor

def obtener_conexion():
    try:
        return psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "5432")),
            user=os.getenv("DB_USER", "promohunt"),
            password=os.getenv("DB_PASSWORD", "promohunt"),
            dbname=os.getenv("DB_NAME", "descuentos_juegos"),
            client_encoding="UTF8",
            connect_timeout=5,
        )
    except Exception as e:
        raise ConnectionError(
            f"No se pudo conectar a PostgreSQL. "
            f"Revisa Docker (docker compose up -d) y el archivo .env. "
            f"Error: {type(e).__name__}: {repr(e)}"
        ) from None


def obtener_cursor(conexion):
<<<<<<< HEAD
    return conexion.cursor(cursor_factory=RealDictCursor)
=======
    return conexion.cursor(cursor_factory=RealDictCursor)
>>>>>>> f9c32cd5a866be81fbb1a05df354dc53f16928cc

import psycopg2
from psycopg2.extras import RealDictCursor
import os

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": os.getenv("DB_PORT", "5432"),
    "user": os.getenv("DB_USER", "promohunt"),
    "password": os.getenv("DB_PASSWORD", "promohunt"),
    "database": os.getenv("DB_NAME", "descuentos_juegos"),
}


def obtener_conexion():
    """Crea y devuelve una nueva conexión a PostgreSQL."""
    return psycopg2.connect(**DB_CONFIG)


def obtener_cursor(conexion):
    """Cursor que retorna filas como diccionarios."""
    return conexion.cursor(cursor_factory=RealDictCursor)

"""
Carga be/descuentos_juegos_postgres.sql en la base indicada por DATABASE_URL.

Uso (Git Bash), con la URL PUBLICA de la base de Railway:
    cd be
    DATABASE_URL="postgresql://..." python cargar_esquema.py
"""
import os
import sys
from pathlib import Path

import psycopg2

url = os.getenv("DATABASE_URL")
if not url:
    sys.exit("Define DATABASE_URL con la URL publica de Postgres (Railway).")

sql = (Path(__file__).parent / "descuentos_juegos_postgres.sql").read_text(encoding="utf-8")

with psycopg2.connect(url, client_encoding="UTF8") as conn:
    with conn.cursor() as cur:
        cur.execute(sql)
print("Esquema y datos cargados correctamente.")

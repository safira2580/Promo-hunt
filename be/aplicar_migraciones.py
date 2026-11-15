import os, sys
from pathlib import Path
import psycopg2
url = os.getenv("DATABASE_URL")
if not url or "TU_DATABASE_URL" in url:
    sys.exit("Define DATABASE_URL con la URL real de Postgres.")
carpeta = Path(__file__).parent / "migrations"
with psycopg2.connect(url, client_encoding="UTF8") as conn:
    with conn.cursor() as cur:
        for n in ["003_url_juego.sql", "004_calificacion_tienda.sql", "005_resenas_like_steam.sql", "006_biblioteca_compras.sql"]:
            cur.execute((carpeta / n).read_text(encoding="utf-8"))
            print("OK ", n)
print("Migraciones aplicadas.")

"""
Llena descuento.url_juego con el enlace DIRECTO a la página de cada juego en Steam.
Busca el juego en Steam por nombre, toma su id y guarda https://store.steampowered.com/app/<id>/

Uso (Git Bash), con la URL PUBLICA de la base de Railway (o la local):
    cd be
    DATABASE_URL="postgresql://..." python llenar_urls_juegos.py --dry-run   # solo muestra, no guarda
    DATABASE_URL="postgresql://..." python llenar_urls_juegos.py             # guarda
    DATABASE_URL="postgresql://..." python llenar_urls_juegos.py --todos     # también reemplaza los ya llenos

Antes, aplica la migración:  be/migrations/003_url_juego.sql
"""
import json
import os
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

import psycopg2

DRY = "--dry-run" in sys.argv
TODOS = "--todos" in sys.argv

url_db = os.getenv("DATABASE_URL")
if not url_db:
    sys.exit("Define DATABASE_URL con la URL de Postgres.")


def norm(t: str) -> str:
    t = unicodedata.normalize("NFD", t).encode("ascii", "ignore").decode().lower()
    return "".join(c for c in t if c.isalnum())


# Juegos donde la búsqueda automática se equivoca o no encuentra nada: nombre en tu BD -> id de Steam.
AJUSTES = {
    "Tomb Raider": 203160,
    "Football Manager 2024": 2252570,
    "Resident Evil 4 Remake": 2050650,
    "NBA 2K25": 2878980,
}

# Resultados que NO son el juego (editores, bandas sonoras, DLC...).
EXCLUIR = ("editor", "soundtrack", "banda sonora", "dlc", "demo", "bundle", "pack", "expansion", "artbook")


def _consulta(termino: str, cc: str):
    q = urllib.parse.quote(termino)
    url = f"https://store.steampowered.com/api/storesearch/?term={q}&cc={cc}&l=spanish"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        items = json.load(r).get("items", [])
    return [i for i in items if not any(x in i["name"].lower() for x in EXCLUIR)]


def buscar_steam(nombre: str):
    if nombre in AJUSTES:
        return {"id": AJUSTES[nombre], "name": nombre}
    for cc in ("co", "us"):
        items = _consulta(nombre, cc)
        if items:
            exacto = [i for i in items if norm(i["name"]) == norm(nombre)]
            return (exacto or items)[0]
    return None


with psycopg2.connect(url_db, client_encoding="UTF8") as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT d.id_descuento, j.nombre
            FROM descuento d
            JOIN juego j ON j.id_juego = d.id_juego
            JOIN plataforma p ON p.id_plataforma = d.id_plataforma
            WHERE p.nombre ILIKE '%%steam%%'
              AND (%s OR d.url_juego IS NULL OR d.url_juego = '')
            ORDER BY d.id_descuento
            """,
            (TODOS,),
        )
        filas = cur.fetchall()
        print(f"{len(filas)} juegos de Steam por revisar.\n")
        for id_desc, nombre in filas:
            try:
                r = buscar_steam(nombre)
            except Exception as e:  # noqa: BLE001
                print(f"[ERROR] {nombre}: {e}")
                continue
            if not r:
                print(f"[SIN RESULTADO] {nombre}")
                continue
            enlace = f"https://store.steampowered.com/app/{r['id']}/"
            marca = "OK " if norm(r["name"]) == norm(nombre) else "REVISAR"
            print(f"[{marca}] {nombre}  ->  {r['name']}  {enlace}")
            if not DRY:
                cur.execute("UPDATE descuento SET url_juego = %s WHERE id_descuento = %s", (enlace, id_desc))
            time.sleep(0.4)
print("\nListo." + (" (modo prueba: no se guardó nada)" if DRY else ""))

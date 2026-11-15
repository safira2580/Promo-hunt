"""
Llena calificacion_tienda con las reseñas de Steam (me gusta / no me gusta) de cada juego.
Lee el id de Steam desde descuento.url_juego (https://store.steampowered.com/app/<id>/),
asi que primero corre llenar_urls_juegos.py.

Uso (Git Bash):
    cd be
    DATABASE_URL="postgresql://..." python llenar_resenas_steam.py --dry-run   # solo muestra
    DATABASE_URL="postgresql://..." python llenar_resenas_steam.py             # guarda (salta los que ya tienen)
    ... python llenar_resenas_steam.py --todos                                 # vuelve a pedir todos

Antes, aplica las migraciones 004 y 005.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

import psycopg2

DRY = "--dry-run" in sys.argv
TODOS = "--todos" in sys.argv  # por defecto salta los juegos que ya tienen reseñas guardadas
url_db = os.getenv("DATABASE_URL")
if not url_db:
    sys.exit("Define DATABASE_URL con la URL de Postgres.")


CABECERAS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    # evita la pantalla de verificación de edad y fuerza inglés (para poder leer el texto de la página)
    "Cookie": "birthtime=568022401; lastagecheckage=1-0-1990; wants_mature_content=1; Steam_Language=english",
}


def _pedir(url: str, esperas=(0, 10, 30, 60)) -> str:
    """Descarga una URL; reintenta con espera solo si Steam responde 429 o vacío."""
    ultimo = None
    for espera in esperas:
        if espera:
            time.sleep(espera)
        try:
            req = urllib.request.Request(url, headers=CABECERAS)
            with urllib.request.urlopen(req, timeout=20) as r:
                cuerpo = r.read().decode("utf-8", "ignore")
            if cuerpo.strip():
                return cuerpo
            ultimo = "respuesta vacía"
        except urllib.error.HTTPError as e:
            ultimo = f"HTTP {e.code}"
            if e.code != 429:
                break
    raise RuntimeError(ultimo)


def _desde_api(appid: str):
    """Método 1: API de reseñas (da los números exactos)."""
    variantes = [
        f"https://store.steampowered.com/appreviews/{appid}?json=1&language=all&purchase_type=all&filter=all&review_type=all&num_per_page=0&cursor=*",
        f"https://store.steampowered.com/appreviews/{appid}?json=1",
    ]
    for url in variantes:
        try:
            datos = json.loads(_pedir(url))
        except (ValueError, RuntimeError):
            continue
        resumen = datos.get("query_summary") or {}
        if "total_positive" in resumen:
            return resumen.get("total_positive", 0), resumen.get("total_negative", 0)
    return None


def _desde_pagina(appid: str):
    """Método 2 (respaldo): lee el texto de reseñas de la página de la tienda.
    Steam solo muestra 'NN% of the X user reviews ... are positive', así que los positivos
    salen de multiplicar ese porcentaje por el total (aproximado por el redondeo del %)."""
    html = _pedir(f"https://store.steampowered.com/app/{appid}/?l=english&cc=us")
    # Steam muestra dos textos: "...user reviews in the last 30 days..." (recientes) y
    # "...user reviews for this game..." (todas). Solo nos sirve el segundo.
    m = re.search(r"(\d{1,3})% of the ([\d,\.]+) user reviews for this game", html)
    if not m:
        return None
    pct = int(m.group(1))
    total = int(re.sub(r"[^\d]", "", m.group(2)))
    pos = round(total * pct / 100)
    return pos, total - pos


def resenas_steam(appid: str):
    r = _desde_api(appid)
    if r:
        return r[0], r[1], "exacto"
    r = _desde_pagina(appid)
    if r:
        return r[0], r[1], "aprox."
    raise RuntimeError("Steam no mostró reseñas para este juego")


with psycopg2.connect(url_db, client_encoding="UTF8") as conn:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT d.id_juego, d.id_plataforma, j.nombre, d.url_juego
            FROM descuento d
            JOIN juego j ON j.id_juego = d.id_juego
            JOIN plataforma p ON p.id_plataforma = d.id_plataforma
            LEFT JOIN calificacion_tienda c
                   ON c.id_juego = d.id_juego AND c.id_plataforma = d.id_plataforma
            WHERE p.nombre ILIKE '%%steam%%' AND d.url_juego LIKE '%%/app/%%'
              AND (%s OR c.votos_positivos IS NULL)
            ORDER BY d.id_juego
            """,
            (TODOS,),
        )
        filas = cur.fetchall()
        print(f"{len(filas)} juegos de Steam por revisar.\n")
        for id_juego, id_plat, nombre, enlace in filas:
            m = re.search(r"/app/(\d+)", enlace)
            if not m:
                continue
            try:
                pos, neg, metodo = resenas_steam(m.group(1))
            except Exception as e:  # noqa: BLE001
                print(f"[ERROR] {nombre}: {e}")
                continue
            print(f"{nombre}: {pos} positivas / {neg} negativas ({metodo})")
            if not DRY:
                cur.execute(
                    """
                    INSERT INTO calificacion_tienda (id_juego, id_plataforma, total_votos, votos_positivos, votos_negativos)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (id_juego, id_plataforma) DO UPDATE
                    SET total_votos = EXCLUDED.total_votos,
                        votos_positivos = EXCLUDED.votos_positivos,
                        votos_negativos = EXCLUDED.votos_negativos
                    """,
                    (id_juego, id_plat, pos + neg, pos, neg),
                )
            time.sleep(1.5)
print("\nListo." + (" (modo prueba: no se guardó nada)" if DRY else ""))

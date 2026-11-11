"""
Pruebas de carga de PromoHunt con Locust.

  pip install locust
  # interfaz web:        locust -f perf/locustfile.py --host http://localhost
  # sin interfaz (CI):   locust -f perf/locustfile.py --host http://localhost --headless \
  #                          -u 50 -r 10 -t 60s --csv perf/resultados

Mezcla de tráfico realista: la mayoría navega el catálogo (lecturas), pocos buscan o
inician sesión (login es CPU-intensivo por bcrypt).
"""

import random

from locust import HttpUser, between, task

USUARIOS = [("maria@gmail.com", "123456"), ("carlos@gmail.com", "123456"), ("luis@gmail.com", "123456")]
BUSQUEDAS = ["forza", "gta", "spider", "ea", "resident", "dying"]


class Visitante(HttpUser):
    wait_time = between(0.5, 2)
    ids_juego: list[int] = []

    def on_start(self):
        r = self.client.get("/api/v1/juegos", name="GET /juegos (carga inicial)")
        if r.ok:
            self.ids_juego = [j["id_juego"] for j in r.json()] or [1]
        self.token = None

    @task(10)
    def catalogo(self):
        self.client.get("/api/v1/juegos", name="GET /juegos")

    @task(6)
    def categorias(self):
        self.client.get("/api/v1/categorias", name="GET /categorias")

    @task(6)
    def detalle(self):
        jid = random.choice(self.ids_juego or [1])
        self.client.get(f"/api/v1/juegos/{jid}", name="GET /juegos/{id}")

    @task(3)
    def buscar(self):
        self.client.get("/api/v1/juegos", params={"buscar": random.choice(BUSQUEDAS)}, name="GET /juegos?buscar")

    @task(1)
    def login_y_perfil(self):
        correo, clave = random.choice(USUARIOS)
        with self.client.post("/api/v1/auth/login", json={"correo": correo, "contrasena": clave},
                              name="POST /auth/login", catch_response=True) as r:
            if r.status_code != 200:
                r.failure(f"login {r.status_code}")
                return
            token = r.json()["access_token"]
        self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}, name="GET /auth/me")

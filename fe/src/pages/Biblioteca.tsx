import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import { imagenJuego } from "../imagenJuego";
import "../components/Extras.css";

interface JuegoComprado {
  id_compra: number;
  id_juego: number;
  nombre: string;
  imagen: string | null;
  plataforma: string;
  precio_pagado: number;
  fecha_compra: string | null;
}

function Biblioteca() {
  const navigate = useNavigate();
  const [juegos, setJuegos] = useState<JuegoComprado[] | null>(null);
  const [sinSesion, setSinSesion] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch("/api/v1/biblioteca")
      .then((r) => {
        if (r.status === 401) {
          setSinSesion(true);
          return [];
        }
        return r.ok ? r.json() : Promise.reject();
      })
      .then(setJuegos)
      .catch(() => setError(true));
  }, []);

  return (
    <section className="container top-products pagina-favoritos">
      <h1 className="heading-1">Mi biblioteca</h1>

      {error && <p className="msg-error">No se pudo cargar tu biblioteca. Revisa que el backend esté corriendo.</p>}
      {!error && juegos === null && <p className="estado-vacio">Cargando tu biblioteca...</p>}

      {sinSesion && (
        <div className="favoritos-vacio">
          <p>Inicia sesión para ver los juegos que has adquirido.</p>
          <button type="button" onClick={() => navigate("/login")}>
            Iniciar sesión
          </button>
        </div>
      )}

      {!sinSesion && juegos && juegos.length === 0 && (
        <div className="favoritos-vacio">
          <p>Aún no has adquirido ningún juego. Elige una oferta y pulsa “Comprar”.</p>
          <button type="button" onClick={() => navigate("/")}>
            Ver ofertas
          </button>
        </div>
      )}

      <div className="container-products">
        {juegos?.map((j) => (
          <div className="card-product" key={j.id_compra}>
            <div className="container-img" onClick={() => navigate(`/juego/${j.id_juego}`)} style={{ cursor: "pointer" }}>
              <img src={imagenJuego(j.nombre, j.imagen)} alt={j.nombre} />
            </div>
            <div className="content-card-product">
              <h3>{j.nombre}</h3>
              <p className="biblioteca-meta">
                {j.plataforma && `${j.plataforma} · `}
                Pagaste ${j.precio_pagado.toFixed(2)}
                {j.fecha_compra && ` · ${new Date(j.fecha_compra).toLocaleDateString("es-CO")}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Biblioteca;

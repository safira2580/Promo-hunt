import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Estrellas from "../components/Estrellas";
import { imagenJuego } from "../imagenJuego";

import "./JuegoDetalle.css";
import { API_URL } from "../config";

interface Juego {
  id_juego: number;
  nombre: string;
  fecha_lanzamiento?: string;
  imagen?: string;
}

interface Descuento {
  id_descuento: number;
  id_plataforma: number;
  precio_original: number;
  precio_descuento: number;
  porcentaje_descuento: number;
  ahorro: number;
  estado: string;
  plataforma: string;
  url_tienda?: string | null;
}

interface ResenaJuego {
  id_resena: number;
  usuario: string;
  titulo: string | null;
  comentario: string | null;
  calificacion: number | null;
  fecha_publicacion: string | null;
}

interface ResenasData {
  promedio: number | null;
  total: number;
  resenas: ResenaJuego[];
}

const precio = (n: number) => `COL$${Number(n).toLocaleString("es-CO")}`;

function Ofertas({ ofertas, vacio }: { ofertas: Descuento[]; vacio: string }) {
  if (ofertas.length === 0) return <p className="tienda-vacio">{vacio}</p>;
  return (
    <div className="tienda-ofertas">
      {ofertas.map((d) => (
        <div className="tienda-oferta" key={d.id_descuento}>
          <div>
            {ofertas.length > 1 && <span className="tienda-nombre-extra">{d.plataforma}</span>}
            <span className="precio-original">{precio(d.precio_original)}</span>
            <strong>{precio(d.precio_descuento)}</strong>
            <span className="descuento">-{d.porcentaje_descuento}%</span>
          </div>
          <button
            className="boton-oferta"
            onClick={() => d.url_tienda && window.open(d.url_tienda, "_blank", "noopener")}
          >
            Ver oferta
          </button>
        </div>
      ))}
    </div>
  );
}

function JuegoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [juego, setJuego] = useState<Juego | null>(null);
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [resenas, setResenas] = useState<ResenasData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerJuego = async () => {
      try {
        const respuesta = await fetch(`${API_URL}/api/v1/juegos/${id}`);
        const datos = await respuesta.json();
        if (!respuesta.ok) {
          setJuego(null);
          return;
        }
        setJuego(datos.juego);
        setDescuentos(datos.descuentos);
      } catch (error) {
        console.error("Error obteniendo juego:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerJuego();

    fetch(`${API_URL}/api/v1/juegos/${id}/resenas`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setResenas)
      .catch(() => setResenas(null));
  }, [id]);

  if (cargando) {
    return (
      <>
        <Header />
        <div className="juego-cargando">Cargando juego...</div>
        <Footer />
      </>
    );
  }

  if (!juego) {
    return (
      <>
        <Header />
        <div className="juego-no-encontrado">
          <h1>Juego no encontrado</h1>
          <button onClick={() => navigate("/")}>Volver al inicio</button>
        </div>
        <Footer />
      </>
    );
  }

  const imagenPortada = imagenJuego(juego.nombre, juego.imagen);

  const nombre = (d: Descuento) => d.plataforma.toLowerCase();
  const epic = descuentos.filter((d) => nombre(d).includes("epic"));
  const steam = descuentos.filter((d) => nombre(d).includes("steam"));
  const otras = descuentos.filter((d) => !nombre(d).includes("epic") && !nombre(d).includes("steam"));

  return (
    <div className="pagina-juego">
      <Header />

      <main className="juego-contenedor">
        <section className="juego-cabecera">
          <div className="juego-imagen">
            <img src={imagenPortada} alt={juego.nombre} />
          </div>

          <div className="juego-informacion">
            <span className="juego-etiqueta">DETALLE DEL JUEGO</span>
            <h1>{juego.nombre}</h1>
            <p>Encuentra las mejores ofertas disponibles para este juego.</p>

            {juego.fecha_lanzamiento && (
              <div className="juego-fecha">
                <strong>Fecha de lanzamiento:</strong>
                <span>{juego.fecha_lanzamiento}</span>
              </div>
            )}
          </div>
        </section>

        <section className="juego-ofertas">
          <div className="seccion-titulo">
            <h2>Ofertas y reseñas</h2>
            <span>{descuentos.length} plataformas</span>
          </div>

          <div className="tiendas-grid">
            <article className="tienda-card">
              <h3>🟦 Epic Games</h3>
              <Ofertas ofertas={epic} vacio="Sin oferta en Epic por ahora." />
            </article>

            <article className="tienda-card">
              <h3>🎮 Steam</h3>
              <Ofertas ofertas={steam} vacio="Sin oferta en Steam por ahora." />
            </article>

            <article className="tienda-card">
              <h3>🛒 Otra tienda</h3>
              <Ofertas ofertas={otras} vacio="Sin ofertas en otras tiendas." />
            </article>

            <article className="tienda-card tienda-promohunt">
              <h3>⭐ PromoHunt</h3>

              {resenas && resenas.total > 0 ? (
                <>
                  <div className="resumen-votos">
                    <strong>{resenas.promedio}</strong>
                    <Estrellas valor={resenas.promedio ?? 0} />
                    <span>({resenas.total} votos)</span>
                  </div>

                  <div className="resenas-mini">
                    {resenas.resenas.slice(0, 3).map((r) => (
                      <div className="resena-mini" key={r.id_resena}>
                        <div className="resena-mini-top">
                          <b>{r.usuario}</b>
                          <Estrellas valor={r.calificacion ?? 0} />
                        </div>
                        {r.titulo && <strong>{r.titulo}</strong>}
                        {r.comentario && <p>{r.comentario}</p>}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="tienda-vacio">Aún no hay reseñas de este juego.</p>
              )}

              <button className="boton-oferta" onClick={() => navigate("/resenas")}>
                Ver todas las reseñas
              </button>
            </article>
          </div>
        </section>

        <section className="juego-extra">
          <div className="juego-extra-card">
            <h3>🛒 Mejor precio</h3>
            {descuentos.length > 0 ? (
              <>
                <strong>{precio(descuentos[0].precio_descuento)}</strong>
                <span>{descuentos[0].plataforma}</span>
              </>
            ) : (
              <span>No disponible</span>
            )}
          </div>

          <div className="juego-extra-card">
            <h3>🎮 Plataformas</h3>
            <strong>{descuentos.length}</strong>
            <span>disponibles</span>
          </div>

          <div className="juego-extra-card">
            <h3>💰 Descuento</h3>
            {descuentos.length > 0 ? (
              <strong>Hasta -{Math.max(...descuentos.map((d) => d.porcentaje_descuento))}%</strong>
            ) : (
              <strong>-</strong>
            )}
            <span>descuento máximo</span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default JuegoDetalle;

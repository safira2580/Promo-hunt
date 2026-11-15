import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaThumbsUp, FaThumbsDown, FaCartShopping, FaCircleCheck } from "react-icons/fa6";
import Estrellas from "../components/Estrellas";
import { imagenJuego } from "../imagenJuego";
import { urlTiendaJuego } from "../tiendas";

import "./JuegoDetalle.css";
import { API_URL } from "../config";
import { apiFetch } from "../api";

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
  url_juego?: string | null;
}

interface Calificacion {
  promedio: number | null;
  total: number;
  positivos?: number | null;
  negativos?: number | null;
}

interface ResenasData extends Calificacion {
  por_tienda?: Record<string, Calificacion>;
}

const precio = (n: number) => `COL$${Number(n).toLocaleString("es-CO")}`;

function Ofertas({ ofertas, vacio, juego, resena }: { ofertas: Descuento[]; vacio: string; juego: string; resena?: ReactNode }) {
  if (ofertas.length === 0) return <p className="tienda-vacio">{vacio}</p>;
  return (
    <div className="tienda-ofertas">
      {ofertas.map((d, i) => {
        const url = d.url_juego || urlTiendaJuego(d.plataforma, juego, d.url_tienda);
        return (
        <div className="tienda-oferta" key={d.id_descuento}>
          <div className="tienda-precios">
            {ofertas.length > 1 && <span className="tienda-nombre-extra">{d.plataforma}</span>}
            <span className="precio-original">{precio(d.precio_original)}</span>
            <strong className="precio-final">{precio(d.precio_descuento)}</strong>
            <span className="descuento">-{d.porcentaje_descuento}%</span>
          </div>
          {i === 0 && resena}
          <button
            className="boton-oferta"
            disabled={!url}
            onClick={() => url && window.open(url, "_blank", "noopener")}
          >
            Ver oferta
          </button>
        </div>
        );
      })}
    </div>
  );
}

function BloqueLikes({ calif }: { calif: Calificacion }) {
  const pos = calif.positivos ?? 0;
  const neg = calif.negativos ?? 0;
  const total = pos + neg;
  const porcentaje = total > 0 ? Math.round((pos / total) * 100) : null;
  const num = (n: number) => n.toLocaleString("es-CO");
  return (
    <div className="tienda-likes">
      <span className="like-si" title="Reseñas positivas">
        <FaThumbsUp /> {num(pos)}
      </span>
      <span className="like-no" title="Reseñas negativas">
        <FaThumbsDown /> {num(neg)}
      </span>
      {porcentaje !== null && <span className="like-porcentaje">{porcentaje}% positivas</span>}
    </div>
  );
}

function BloqueCalificacion({ calif }: { calif: Calificacion }) {
  if (calif.positivos != null || calif.negativos != null) return <BloqueLikes calif={calif} />;
  if (calif.promedio === null) {
    return <p className="tienda-vacio">Aún sin calificaciones.</p>;
  }
  return (
    <div className="tienda-calif">
      <span className="tienda-calif-nota">{calif.promedio}</span>
      <div>
        <Estrellas valor={calif.promedio} />
        {calif.total > 0 && (
          <span className="votos">
            {calif.total} {calif.total === 1 ? "voto" : "votos"}
          </span>
        )}
      </div>
    </div>
  );
}

interface TarjetaProps {
  clase: string;
  logo: string;
  nombre: string;
  juego?: string;
  ofertas?: Descuento[];
  vacio?: string;
  calif?: Calificacion;
  children?: ReactNode;
}

function TarjetaTienda({ clase, logo, nombre, juego, ofertas, vacio, calif, children }: TarjetaProps) {
  return (
    <article className={`tienda-card tienda-${clase}`}>
      <header className="tienda-cabecera">
        <span className="tienda-logo">{logo}</span>
        <h3>{nombre}</h3>
      </header>
      <div className="tienda-cuerpo">
        {ofertas && <Ofertas ofertas={ofertas} vacio={vacio ?? "Sin oferta por ahora."} juego={juego ?? ""} resena={calif ? <BloqueCalificacion calif={calif} /> : undefined} />}
        {calif && !(ofertas && ofertas.length > 0) && <BloqueCalificacion calif={calif} />}
        {children}
      </div>
    </article>
  );
}

function JuegoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [juego, setJuego] = useState<Juego | null>(null);
  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [resenas, setResenas] = useState<ResenasData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [enBiblioteca, setEnBiblioteca] = useState(false);

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

  // ¿Ya lo compró este usuario? (sin sesión, la biblioteca responde 401 y no pasa nada)
  useEffect(() => {
    apiFetch("/api/v1/biblioteca")
      .then((r) => (r.ok ? r.json() : []))
      .then((lista: { id_juego: number }[]) => setEnBiblioteca(lista.some((j) => j.id_juego === Number(id))))
      .catch(() => setEnBiblioteca(false));
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

  // Oferta con el mejor precio: es la que se compra desde el botón de la cabecera
  const mejorOferta = descuentos.length
    ? descuentos.reduce((a, b) => (Number(b.precio_descuento) < Number(a.precio_descuento) ? b : a))
    : null;

  const nombre = (d: Descuento) => d.plataforma.toLowerCase();
  const steam = descuentos.filter((d) => nombre(d).includes("steam"));
  const epic = descuentos.filter((d) => nombre(d).includes("epic"));

  const califPromoHunt: Calificacion | undefined = resenas
    ? { promedio: resenas.promedio, total: resenas.total }
    : undefined;

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

            <div className="juego-compra">
              {enBiblioteca ? (
                <button className="boton-comprar en-biblioteca" onClick={() => navigate("/biblioteca")}>
                  <FaCircleCheck /> En tu biblioteca
                </button>
              ) : mejorOferta ? (
                <>
                  <button className="boton-comprar" onClick={() => navigate(`/checkout/${mejorOferta.id_descuento}`)}>
                    <FaCartShopping /> Comprar por {precio(mejorOferta.precio_descuento)}
                  </button>
                  <span className="juego-compra-nota">
                    Mejor precio en {mejorOferta.plataforma} · -{mejorOferta.porcentaje_descuento}%
                  </span>
                </>
              ) : (
                <button className="boton-comprar" disabled>
                  Sin ofertas disponibles
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="juego-ofertas">
          <div className="seccion-titulo">
            <h2>Ofertas y calificaciones</h2>
            <span>{descuentos.length} plataformas</span>
          </div>

          <div className="tiendas-grid">
            <TarjetaTienda
              clase="epic"
              logo="E"
              nombre="Epic Games" juego={juego.nombre} ofertas={epic} vacio="Sin oferta en Epic por ahora."
              calif={resenas?.por_tienda?.epic ?? { promedio: null, total: 0 }}
            />

            <TarjetaTienda
              clase="steam"
              logo="S"
              nombre="Steam"
              juego={juego.nombre}
              ofertas={steam}
              vacio="Sin oferta en Steam por ahora."
              calif={resenas?.por_tienda?.steam ?? { promedio: null, total: 0 }}
            />

            <TarjetaTienda clase="promohunt" logo="P" nombre="PromoHunt" calif={califPromoHunt}>
              <button className="boton-oferta" onClick={() => navigate("/resenas")}>
                Ver reseñas mundiales
              </button>
            </TarjetaTienda>
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

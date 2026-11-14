import { useEffect, useState } from "react";

import {
  FaEye,
  FaHeart,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";

import { API_URL } from "../config";
import { imagenJuego } from "../imagenJuego";
import JuegoModal from "./JuegoModal";
import { useFavoritos } from "../useFavoritos";
import "./Extras.css";

interface Juego {
  id_juego: number;
  nombre: string;
  fecha_lanzamiento: string;
  precio_original: number;
  precio_descuento: number;
  porcentaje_descuento: number;
  plataforma: string;
  id_categoria?: number;
  categoria?: string;
  imagen?: string | null;
  url_tienda?: string | null;
}

interface ProductsProps {
  categoriaActiva?: number | null;
}

function Products({ categoriaActiva = null }: ProductsProps) {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState("destacados");
  const [modal, setModal] = useState<{ juego: Juego; completo: boolean } | null>(null);
  const { ids: favoritos, alternar } = useFavoritos();

  /*
   * OBTENER JUEGOS DESDE FLASK
   */
  useEffect(() => {
    fetch(`${API_URL}/api/v1/juegos`)
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudieron obtener los juegos");
        }
        return respuesta.json();
      })
      .then((datos: Juego[]) => {
        // El API devuelve una fila por cada tienda; mostramos una tarjeta por juego con su mejor precio.
        const mejores = new Map<number, Juego>();
        for (const j of datos) {
          const previo = mejores.get(j.id_juego);
          if (!previo || Number(j.precio_descuento) < Number(previo.precio_descuento)) {
            mejores.set(j.id_juego, j);
          }
        }
        setJuegos([...mejores.values()]);
        setCargando(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message);
        setCargando(false);
      });
  }, []);

  /*
   * FILTROS (categoría + destacados / recientes / vendidos)
   */
  const juegosFiltrados = [...juegos]
    .filter((j) => {
      if (categoriaActiva == null) return true;
      return j.id_categoria === categoriaActiva;
    })
    .sort((a, b) => {
      if (filtro === "destacados" || filtro === "vendidos") {
        return b.porcentaje_descuento - a.porcentaje_descuento;
      }

      if (filtro === "recientes") {
        return (
          new Date(b.fecha_lanzamiento).getTime() -
          new Date(a.fecha_lanzamiento).getTime()
        );
      }

      return 0;
    });

  /*
   * PÁGINA
   */
  return (
    <section className="container top-products" id="productos">
      <h1 className="heading-1">Mejores opciones en descuento</h1>

      {/* OPCIONES */}
      <div className="container-options">
        <span
          className={filtro === "destacados" ? "active" : ""}
          onClick={() => setFiltro("destacados")}
        >
          Destacados
        </span>

        <span
          className={filtro === "recientes" ? "active" : ""}
          onClick={() => setFiltro("recientes")}
        >
          Más recientes
        </span>

        <span
          className={filtro === "vendidos" ? "active" : ""}
          onClick={() => setFiltro("vendidos")}
        >
          Mejores Vendidos
        </span>
      </div>

      {/* PRODUCTOS */}
      <div className="container-products">
        {cargando && <p>Cargando juegos...</p>}

        {error && <p>Error: {error}</p>}

        {!cargando &&
          !error &&
          juegosFiltrados.length === 0 && (
            <p>No hay juegos en esta categoría.</p>
          )}

        {!cargando &&
          !error &&
          juegosFiltrados.map((juego) => {
            const imagen = imagenJuego(juego.nombre, juego.imagen);

            return (
              <div className="card-product" key={juego.id_juego}>
                {/* IMAGEN */}
                <div className="container-img">
                  {imagen && (
                    <img src={imagen} alt={juego.nombre} />
                  )}

                  <span className="discount">
                    -{juego.porcentaje_descuento}%
                  </span>

                  {/* ICONOS */}
                  <div className="button-group">
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver detalles de ${juego.nombre}`}
                      title="Ver detalles"
                      onClick={() => setModal({ juego, completo: true })}
                      onKeyDown={(e) => e.key === "Enter" && setModal({ juego, completo: true })}
                    >
                      <FaEye />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      className={favoritos.includes(juego.id_juego) ? "fav-activo" : ""}
                      aria-label={favoritos.includes(juego.id_juego) ? "Quitar de favoritos" : "Agregar a favoritos"}
                      onClick={() => alternar(juego.id_juego)}
                      onKeyDown={(e) => e.key === "Enter" && alternar(juego.id_juego)}
                    >
                      <FaHeart />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver tiendas donde está ${juego.nombre}`}
                      title="Ver tiendas"
                      onClick={() => setModal({ juego, completo: false })}
                      onKeyDown={(e) => e.key === "Enter" && setModal({ juego, completo: false })}
                    >
                      <FaArrowUpRightFromSquare />
                    </span>
                  </div>
                </div>

                {/* INFORMACIÓN */}
                <div className="content-card-product">
                  <h3>{juego.nombre}</h3>

                  <p className="price">
                    ${juego.precio_descuento}
                    <span>${juego.precio_original}</span>
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      {modal && (
        <JuegoModal
          idJuego={modal.juego.id_juego}
          nombre={modal.juego.nombre}
          imagen={modal.juego.imagen}
          completo={modal.completo}
          onCerrar={() => setModal(null)}
        />
      )}
    </section>
  );
}

export default Products;
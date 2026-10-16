import { useEffect, useState } from "react";

import {
  FaEye,
  FaHeart,
  FaCodeCompare,
} from "react-icons/fa6";

import gta5 from "../assets/img/gta5.jpg";
import f125 from "../assets/img/f125.jpg";
import requiem from "../assets/img/requiem.jpg";
import dytb from "../assets/img/DYTB.jpg";
import mirage from "../assets/img/asc mirage.jpg";
import fc26 from "../assets/img/fc26.jpg";
import spider2 from "../assets/img/spider2.jpg";
import forza6 from "../assets/img/Forza6.jpg";

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
}

interface ProductsProps {
  categoriaActiva?: number | null;
}

function Products({ categoriaActiva = null }: ProductsProps) {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtro, setFiltro] = useState("destacados");

  /*
   * IMÁGENES
   */
  const imagenes: Record<string, string> = {
    "GTA V": gta5,
    "F1 25": f125,
    "resident evil requiem": requiem,
    "Dying Light The Beast": dytb,
    "Assassins Creed Mirage": mirage,
    "EA FC 26": fc26,
    "Spiderman 2": spider2,
    "Forza Horizon 6": forza6,
  };

  /*
   * OBTENER JUEGOS DESDE FLASK
   */
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/juegos")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudieron obtener los juegos");
        }
        return respuesta.json();
      })
      .then((datos: Juego[]) => {
        console.log("Juegos recibidos:", datos);
        setJuegos(datos);
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
            const imagen = imagenes[juego.nombre];

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
                    <span>
                      <FaEye />
                    </span>
                    <span>
                      <FaHeart />
                    </span>
                    <span>
                      <FaCodeCompare />
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
    </section>
  );
}

export default Products;
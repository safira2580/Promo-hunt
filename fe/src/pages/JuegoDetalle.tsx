import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import gta5 from "../assets/img/gta5.jpg";
import f125 from "../assets/img/f125.jpg";
import requiem from "../assets/img/requiem.jpg";
import dytb from "../assets/img/DYTB.jpg";
import mirage from "../assets/img/asc mirage.jpg";
import fc26 from "../assets/img/fc26.jpg";
import spider2 from "../assets/img/spider2.jpg";
import forza6 from "../assets/img/Forza6.jpg";



import "./JuegoDetalle.css";


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

}

const imagenesJuegos: { [key: number]: string } = {
  1: gta5,
  2: f125,
  3: spider2,
  4: requiem,
  5: dytb,
  6: mirage,
  7: fc26,
  8: forza6,
};


function JuegoDetalle() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [juego, setJuego] =
    useState<Juego | null>(null);

  const [descuentos, setDescuentos] =
    useState<Descuento[]>([]);

  const [cargando, setCargando] =
    useState(true);


  // ==========================================
  // OBTENER JUEGO
  // ==========================================

  useEffect(() => {

    const obtenerJuego = async () => {

      try {

        const respuesta = await fetch(
          `http://localhost:5000/api/juegos/${id}`
        );


        const datos = await respuesta.json();


        console.log(
          "Detalle del juego:",
          datos
        );


        if (!respuesta.ok) {

          setJuego(null);

          return;

        }


        setJuego(datos.juego);

        setDescuentos(
          datos.descuentos
        );


      } catch (error) {

        console.error(
          "Error obteniendo juego:",
          error
        );

      } finally {

        setCargando(false);

      }

    };


    obtenerJuego();

  }, [id]);


  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {

    return (

      <>

        <Header />

        <div className="juego-cargando">

          Cargando juego...

        </div>

        <Footer />

      </>

    );

  }


  // ==========================================
  // JUEGO NO ENCONTRADO
  // ==========================================

  if (!juego) {

    return (

      <>

        <Header />

        <div className="juego-no-encontrado">

          <h1>
            Juego no encontrado
          </h1>

          <button
            onClick={() => navigate("/")}
          >
            Volver al inicio
          </button>

        </div>

        <Footer />

      </>

    );

  }


  // ==========================================
  // IMAGEN
  // ==========================================

const imagenJuego =
  imagenesJuegos[juego.id_juego] ||
  "/default-game.jpg";


  return (

    <div className="pagina-juego">

      <Header />


      <main className="juego-contenedor">


        {/* =====================================
            CABECERA DEL JUEGO
        ===================================== */}

        <section className="juego-cabecera">

          <div className="juego-imagen">

            <img
              src={imagenJuego}
              alt={juego.nombre}
            />

          </div>


          <div className="juego-informacion">

            <span className="juego-etiqueta">
              DETALLE DEL JUEGO
            </span>

            <h1>
              {juego.nombre}
            </h1>

            <p>
              Encuentra las mejores ofertas
              disponibles para este juego.
            </p>


            {juego.fecha_lanzamiento && (

              <div className="juego-fecha">

                <strong>
                  Fecha de lanzamiento:
                </strong>

                <span>
                  {juego.fecha_lanzamiento}
                </span>

              </div>

            )}

          </div>

        </section>


        {/* =====================================
            OFERTAS
        ===================================== */}

        <section className="juego-ofertas">

          <div className="seccion-titulo">

            <h2>
              Ofertas disponibles
            </h2>

            <span>
              {descuentos.length} plataformas
            </span>

          </div>


          {descuentos.length === 0 ? (

            <div className="sin-ofertas">

              Actualmente no hay ofertas
              disponibles.

            </div>

          ) : (

            <div className="lista-ofertas">

              {descuentos.map((descuento) => (

                <div
                  className="oferta"
                  key={descuento.id_descuento}
                >


                  {/* PLATAFORMA */}

                  <div className="oferta-plataforma">

                    <div className="icono-plataforma">
                      🎮
                    </div>

                    <div>

                      <strong>
                        {descuento.plataforma}
                      </strong>

                      <span>
                        Oferta disponible
                      </span>

                    </div>

                  </div>


                  {/* PRECIO */}

                  <div className="oferta-precio">

                    <span className="precio-original">

                      COL$
                      {Number(
                        descuento.precio_original
                      ).toLocaleString("es-CO")}

                    </span>


                    <strong>

                      COL$
                      {Number(
                        descuento.precio_descuento
                      ).toLocaleString("es-CO")}

                    </strong>


                    <span className="descuento">

                      -{descuento.porcentaje_descuento}%

                    </span>

                  </div>


                  {/* BOTÓN */}

                  <button
                    className="boton-oferta"
                    onClick={() => {

                      console.log(
                        "Seleccionó:",
                        descuento.plataforma
                      );

                    }}
                  >
                    Ver oferta
                  </button>


                </div>

              ))}

            </div>

          )}

        </section>


        {/* =====================================
            INFORMACIÓN
        ===================================== */}

        <section className="juego-extra">

          <div className="juego-extra-card">

            <h3>
              🛒 Mejor precio
            </h3>

            {descuentos.length > 0 ? (

              <>

                <strong>

                  COL$
                  {Number(
                    descuentos[0].precio_descuento
                  ).toLocaleString("es-CO")}

                </strong>

                <span>
                  {descuentos[0].plataforma}
                </span>

              </>

            ) : (

              <span>
                No disponible
              </span>

            )}

          </div>


          <div className="juego-extra-card">

            <h3>
              🎮 Plataformas
            </h3>

            <strong>
              {descuentos.length}
            </strong>

            <span>
              disponibles
            </span>

          </div>


          <div className="juego-extra-card">

            <h3>
              💰 Descuento
            </h3>

            {descuentos.length > 0 ? (

              <strong>
                Hasta -
                {Math.max(
                  ...descuentos.map(
                    d => d.porcentaje_descuento
                  )
                )}%
              </strong>

            ) : (

              <strong>
                -
              </strong>

            )}

            <span>
              descuento máximo
            </span>

          </div>

        </section>


      </main>


      <Footer />

    </div>

  );

}


export default JuegoDetalle;
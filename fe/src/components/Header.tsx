import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHeadset,
  FaUser,
  FaBars,
  FaMagnifyingGlass
} from "react-icons/fa6";

import logo from "../assets/img/logo.png";

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
  porcentaje_descuento?: number;
  precio_descuento?: number;
  precio_original?: number;
}


interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  foto_perfil?: string | null;
  fecha_registro?: string;
  rol?: string;
}


/* ==========================================
   IMÁGENES DE LOS JUEGOS
   ========================================== */

const imagenes: { [key: string]: string } = {

  "GTA V": gta5,

  "F1 25": f125,

  "resident evil requiem": requiem,

  "Dying Light The Beast": dytb,

  "Assassins Creed Mirage": mirage,

  "EA FC 26": fc26,

  "Spiderman 2": spider2,

  "Forza Horizon 6": forza6,

};


/* ==========================================
   HEADER
   ========================================== */

function Header() {

  const navigate = useNavigate();


  /* ==========================================
     BUSCADOR
     ========================================== */

  const [busqueda, setBusqueda] = useState("");

  const [juegos, setJuegos] = useState<Juego[]>([]);

  const [mostrarResultados, setMostrarResultados] = useState(false);


  /* ==========================================
     USUARIO
     ========================================== */

  const [usuario, setUsuario] = useState<Usuario | null>(null);


  /* ==========================================
     COMPROBAR SESIÓN
     ========================================== */

  useEffect(() => {

    fetch(
      "http://localhost:5000/api/usuario/me",
      {
        method: "GET",
        credentials: "include",
      }
    )

      .then(async (respuesta) => {

        if (!respuesta.ok) {

          setUsuario(null);

          return;

        }


        const datos = await respuesta.json();


        if (datos.logueado) {

          setUsuario(datos.usuario);

        } else {

          setUsuario(null);

        }

      })

      .catch((error) => {

        console.error(
          "Error comprobando sesión:",
          error
        );

        setUsuario(null);

      });

  }, []);


  /* ==========================================
     BUSCAR JUEGOS
     ========================================== */

  useEffect(() => {

    if (busqueda.trim() === "") {

      setJuegos([]);

      setMostrarResultados(false);

      return;

    }


    fetch(
      `http://localhost:5000/api/juegos?buscar=${encodeURIComponent(busqueda)}`
    )

      .then(res => res.json())

      .then(data => {

        setJuegos(data);

        setMostrarResultados(true);

      })

      .catch(error => {

        console.error(
          "Error buscando juegos:",
          error
        );

        setJuegos([]);

      });

  }, [busqueda]);


  /* ==========================================
     ABRIR JUEGO
     ========================================== */

  const abrirJuego = (id: number) => {

    window.location.href = `/juego/${id}`;

  };


  /* ==========================================
     RENDER
     ========================================== */

  return (

    <header>

      {/* ======================================
          PARTE SUPERIOR
          ====================================== */}

      <div className="container-hero">

        <div className="container hero">


          {/* SOPORTE */}

          <div className="customer-support">

            <FaHeadset />

            <div className="content-customer-support">

              <span className="text">
                Soporte al cliente
              </span>

              <span className="number">
                +57 319-6896747 o +57 3046829643
              </span>

            </div>

          </div>


          {/* LOGO */}

          <div className="container-logo">

            <img
              src={logo}
              alt="Logo"
            />

            <h1 className="logo">

              <a href="/">
                PromoHunt
              </a>

            </h1>

          </div>


          {/* ==================================
              USUARIO
              ================================== */}

          <div className="container-user">

            <button
              className="user-button"

              onClick={() => {

                if (usuario) {

                  navigate("/perfil");

                } else {

                  navigate("/login");

                }

              }}

              title={
                usuario
                  ? "Ver perfil"
                  : "Iniciar sesión"
              }

            >

              {usuario?.foto_perfil ? (

                <img
                  src={usuario.foto_perfil}
                  alt="Foto de perfil"
                  className="user-photo"
                />

              ) : (

                <FaUser />

              )}

            </button>

          </div>


        </div>

      </div>


      {/* ======================================
          NAVBAR
          ====================================== */}

      <div className="container-navbar">

        <nav className="navbar container">


          <FaBars />


          <ul className="menu">

            <li>

              <a href="/">
                Inicio
              </a>

            </li>


            <li>

              <a href="#">
                Descuentos
              </a>

            </li>


            <li>

              <a href="#">
                Juegos
              </a>

            </li>


            <li>

              <a href="#">
                Plataformas
              </a>

            </li>


            <li>

              <a href="#">
                Comunidad
              </a>

            </li>

          </ul>


          {/* ==================================
              BUSCADOR
              ================================== */}

          <form
            className="search-form"

            onSubmit={(e) =>
              e.preventDefault()
            }
          >


            <input

              type="search"

              placeholder="Buscar juegos..."

              value={busqueda}

              onChange={(e) => {

                setBusqueda(e.target.value);

              }}

              onFocus={() => {

                if (
                  busqueda.trim() !== ""
                ) {

                  setMostrarResultados(true);

                }

              }}

            />


            <button
              type="submit"
              className="btn-search"
            >

              <FaMagnifyingGlass />

            </button>


            {/* ==================================
                RESULTADOS
                ================================== */}

            {mostrarResultados &&
              busqueda.trim() !== "" && (

              <div className="search-results">


                {juegos.filter((juego) =>

                  juego.nombre
                    .toLowerCase()
                    .includes(
                      busqueda.toLowerCase()
                    )

                ).length > 0 ? (


                  juegos

                    .filter((juego) =>

                      juego.nombre
                        .toLowerCase()
                        .includes(
                          busqueda.toLowerCase()
                        )

                    )

                    .map((juego) => (

                      <div

                        className="search-result"

                        key={juego.id_juego}

                        onClick={() =>
                          abrirJuego(
                            juego.id_juego
                          )
                        }

                      >


                        <div className="search-result-info">

                          <FaMagnifyingGlass />

                          <span>
                            {juego.nombre}
                          </span>

                        </div>


                        <img

                          src={
                            imagenes[
                              juego.nombre
                            ] || ""
                          }

                          alt={juego.nombre}

                        />


                      </div>

                    ))


                ) : (


                  <div className="no-results">

                    No se encontraron juegos

                  </div>


                )}


              </div>

            )}


          </form>


        </nav>

      </div>


    </header>

  );

}


export default Header;
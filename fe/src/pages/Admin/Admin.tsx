import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import JuegosAdmin from "./Secciones/JuegosAdmin";
import DescuentosAdmin from "./Secciones/DescuentosAdmin";
import DesarrolladoresAdmin from "./Secciones/DesarrolladoresAdmin";
import GenerosAdmin from "./Secciones/GenerosAdmin";
import CategoriasAdmin from "./Secciones/CategoriasAdmin";
import ResenasAdmin from "./Secciones/ResenasAdmin";

import "./Admin.css";

function Admin() {

  const [seccion, setSeccion] = useState("inicio");

  return (

    <div className="admin-page">

      <Header />

      <div className="admin-layout">

        {/* =================================
            MENÚ LATERAL
        ================================= */}

        <aside className="admin-sidebar">

          <div className="admin-sidebar-title">

            <span>⚙️</span>

            <div>

              <strong>
                Admin
              </strong>

              <small>
                Panel de control
              </small>

            </div>

          </div>


          <nav className="admin-menu">

            {/* INICIO */}

            <button
              className={
                seccion === "inicio"
                  ? "admin-menu-active"
                  : ""
              }
              onClick={() =>
                setSeccion("inicio")
              }
            >
              🏠
              <span>
                Inicio
              </span>
            </button>


            {/* JUEGOS */}

            <button
              className={
                seccion === "juegos"
                  ? "admin-menu-active"
                  : ""
              }
              onClick={() =>
                setSeccion("juegos")
              }
            >
              🎮
              <span>
                Juegos
              </span>
            </button>


            {/* DESCUENTOS */}

            <button
              className={
                seccion === "descuentos"
                  ? "admin-menu-active"
                  : ""
              }
              onClick={() =>
                setSeccion("descuentos")
              }
            >
              💰
              <span>
                Descuentos
              </span>
            </button>


            {/* DESARROLLADORES */}

            <button
              className={
                seccion === "desarrolladores"
                  ? "admin-menu-active"
                  : ""
              }
              onClick={() =>
                setSeccion("desarrolladores")
              }
            >
              👨‍💻
              <span>
                Desarrolladores
              </span>
            </button>


            {/* GÉNEROS */}

            <button
              className={
                seccion === "generos"
                  ? "admin-menu-active"
                  : ""
              }
              onClick={() =>
                setSeccion("generos")
              }
            >
              🎭
              <span>
                Géneros
              </span>
            </button>


            {/* CATEGORÍAS */}

            <button
              className={
                seccion === "categorias"
                  ? "admin-menu-active"
                  : ""
              }
              onClick={() =>
                setSeccion("categorias")
              }
            >
              📁
              <span>
                Categorías
              </span>
            </button>


            {/* RESEÑAS */}

            <button
              className={
                seccion === "resenas"
                  ? "admin-menu-active"
                  : ""
              }
              onClick={() =>
                setSeccion("resenas")
              }
            >
              ⭐
              <span>
                Reseñas
              </span>
            </button>

          </nav>

        </aside>


        {/* =================================
            CONTENIDO
        ================================= */}

        <main className="admin-content">


          {/* =================================
              INICIO
          ================================= */}

          {seccion === "inicio" && (

            <>

              <div className="admin-header">

                <div>

                  <span className="admin-label">
                    PANEL DE ADMINISTRACIÓN
                  </span>

                  <h1>
                    Bienvenido, administrador 👋
                  </h1>

                  <p>
                    Gestiona los juegos, descuentos,
                    desarrolladores y contenido de PromoHunt.
                  </p>

                </div>

              </div>


              <div className="admin-cards">


                {/* JUEGOS */}

                <div
                  className="admin-card"
                  onClick={() =>
                    setSeccion("juegos")
                  }
                >

                  <span className="admin-card-icon">
                    🎮
                  </span>

                  <h3>
                    Juegos
                  </h3>

                  <p>
                    Gestiona los juegos disponibles
                    en PromoHunt.
                  </p>

                </div>


                {/* DESCUENTOS */}

                <div
                  className="admin-card"
                  onClick={() =>
                    setSeccion("descuentos")
                  }
                >

                  <span className="admin-card-icon">
                    💰
                  </span>

                  <h3>
                    Descuentos
                  </h3>

                  <p>
                    Administra precios y ofertas.
                  </p>

                </div>


                {/* DESARROLLADORES */}

                <div
                  className="admin-card"
                  onClick={() =>
                    setSeccion("desarrolladores")
                  }
                >

                  <span className="admin-card-icon">
                    👨‍💻
                  </span>

                  <h3>
                    Desarrolladores
                  </h3>

                  <p>
                    Gestiona los desarrolladores
                    de los juegos.
                  </p>

                </div>


                {/* GÉNEROS */}

                <div
                  className="admin-card"
                  onClick={() =>
                    setSeccion("generos")
                  }
                >

                  <span className="admin-card-icon">
                    🎭
                  </span>

                  <h3>
                    Géneros
                  </h3>

                  <p>
                    Administra los géneros
                    de los juegos.
                  </p>

                </div>


                {/* CATEGORÍAS */}

                <div
                  className="admin-card"
                  onClick={() =>
                    setSeccion("categorias")
                  }
                >

                  <span className="admin-card-icon">
                    📁
                  </span>

                  <h3>
                    Categorías
                  </h3>

                  <p>
                    Gestiona las categorías.
                  </p>

                </div>


                {/* RESEÑAS */}

                <div
                  className="admin-card"
                  onClick={() =>
                    setSeccion("resenas")
                  }
                >

                  <span className="admin-card-icon">
                    ⭐
                  </span>

                  <h3>
                    Reseñas
                  </h3>

                  <p>
                    Administra las reseñas
                    de los usuarios.
                  </p>

                </div>


              </div>

            </>

          )}


          {/* =================================
              JUEGOS
          ================================= */}

          {seccion === "juegos" && (
            <JuegosAdmin />
          )}


          {/* =================================
              DESCUENTOS
          ================================= */}

          {seccion === "descuentos" && (
            <DescuentosAdmin />
          )}


          {/* =================================
              DESARROLLADORES
          ================================= */}

          {seccion === "desarrolladores" && (
            <DesarrolladoresAdmin />
          )}


          {/* =================================
              GÉNEROS
          ================================= */}

          {seccion === "generos" && (
            <GenerosAdmin />
          )}


          {/* =================================
              CATEGORÍAS
          ================================= */}

          {seccion === "categorias" && (
            <CategoriasAdmin />
          )}


          {/* =================================
              RESEÑAS
          ================================= */}

          {seccion === "resenas" && (
            <ResenasAdmin />
          )}

        </main>

      </div>


      <Footer />

    </div>

  );
}

export default Admin;
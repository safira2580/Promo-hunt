import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


import {
  FaSteam,
  FaXbox,
  FaPlaystation
} from "react-icons/fa6";

import "./Perfil.css";

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  foto_perfil?: string | null;
  fecha_registro?: string;
  rol?: string;
}

interface Crossplay {
  steam?: number | boolean;
  epic_games?: number | boolean;
  xbox_store?: number | boolean;
  playstation_store?: number | boolean;
  riot_games?: number | boolean;
}

function Perfil() {

  const navigate = useNavigate();

  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [crossplay, setCrossplay] =
    useState<Crossplay | null>(null);

  const [cargando, setCargando] =
    useState(true);

  // ==========================================
  // EDITAR PERFIL
  // ==========================================

  const [editando, setEditando] =
    useState(false);

  const [nombreEditado, setNombreEditado] =
    useState("");

  const [correoEditado, setCorreoEditado] =
    useState("");

  const [contrasenaActual, setContrasenaActual] =
    useState("");

  const [nuevaContrasena, setNuevaContrasena] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);


  // ==========================================
  // OBTENER PERFIL
  // ==========================================

  useEffect(() => {

    const obtenerPerfil = async () => {

      try {

        const respuesta = await fetch(
          "http://localhost:5000/api/usuario/perfil",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const datos = await respuesta.json();

        console.log(
          "Respuesta perfil:",
          datos
        );

        if (!respuesta.ok) {

          console.log(
            "La sesión no fue reconocida por Flask"
          );

          navigate("/login");

          return;
        }

        setUsuario(datos.usuario);
        setCrossplay(datos.crossplay);

        // Datos iniciales para edición
        setNombreEditado(datos.usuario.nombre);
        setCorreoEditado(datos.usuario.correo);

        setCargando(false);

      } catch (error) {

        console.error(
          "Error obteniendo perfil:",
          error
        );

        setCargando(false);

      }

    };

    obtenerPerfil();

  }, [navigate]);


  // ==========================================
  // ACTIVAR EDICIÓN
  // ==========================================

  const comenzarEdicion = () => {

    if (!usuario) {
      return;
    }

    setNombreEditado(usuario.nombre);
    setCorreoEditado(usuario.correo);

    setContrasenaActual("");
    setNuevaContrasena("");
    setMensaje("");

    setEditando(true);

  };


  // ==========================================
  // CANCELAR EDICIÓN
  // ==========================================

  const cancelarEdicion = () => {

    if (!usuario) {
      return;
    }

    setNombreEditado(usuario.nombre);
    setCorreoEditado(usuario.correo);

    setContrasenaActual("");
    setNuevaContrasena("");
    setMensaje("");

    setEditando(false);

  };


  // ==========================================
  // GUARDAR CAMBIOS
  // ==========================================

  const guardarCambios = async () => {

    if (!usuario) {
      return;
    }

    if (!nombreEditado.trim()) {

      setMensaje(
        "El nombre de usuario no puede estar vacío"
      );

      return;
    }

    if (!correoEditado.trim()) {

      setMensaje(
        "El correo no puede estar vacío"
      );

      return;
    }

    // Si quiere cambiar contraseña,
    // debe llenar ambos campos

    if (
      nuevaContrasena &&
      !contrasenaActual
    ) {

      setMensaje(
        "Debes ingresar tu contraseña actual"
      );

      return;
    }

    if (
      contrasenaActual &&
      !nuevaContrasena
    ) {

      setMensaje(
        "Debes ingresar la nueva contraseña"
      );

      return;
    }


    setMensaje("");
    setGuardando(true);


    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/usuario/editar",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          credentials: "include",

          body: JSON.stringify({

            nombre:
              nombreEditado.trim(),

            correo:
              correoEditado.trim(),

            contrasena_actual:
              contrasenaActual,

            nueva_contrasena:
              nuevaContrasena

          })

        }
      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        setMensaje(
          datos.mensaje ||
          "No se pudieron guardar los cambios"
        );

        setGuardando(false);

        return;
      }


      // ==========================================
      // ACTUALIZAR DATOS EN PANTALLA
      // ==========================================

      setUsuario({

        ...usuario,

        nombre:
          nombreEditado.trim(),

        correo:
          correoEditado.trim()

      });


      // ==========================================
      // LIMPIAR CONTRASEÑAS
      // ==========================================

      setContrasenaActual("");
      setNuevaContrasena("");


      setMensaje(
        "Perfil actualizado correctamente ✓"
      );

      setEditando(false);

    } catch (error) {

      console.error(
        "Error actualizando perfil:",
        error
      );

      setMensaje(
        "No se pudo conectar con el servidor"
      );

    }

    setGuardando(false);

  };


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  const cerrarSesion = async () => {

    try {

      await fetch(
        "http://localhost:5000/api/logout",
        {
          method: "POST",
          credentials: "include"
        }
      );

      navigate("/");
      window.location.reload();

    } catch (error) {

      console.error(
        "Error cerrando sesión:",
        error
      );

    }

  };


  // ==========================================
  // CARGANDO
  // ==========================================

  if (cargando) {

    return (
      <div className="perfil-cargando">
        Cargando perfil...
      </div>
    );

  }


  if (!usuario) {
    return null;
  }


  // ==========================================
  // FOTO
  // ==========================================

  const fotoPerfil = usuario.foto_perfil
  ? usuario.foto_perfil
  : "/img/default-user.jpg";


  // ==========================================
  // PLATAFORMAS
  // ==========================================

  const estaConectada = (
    estado?: number | boolean
  ) => {

    return (
      estado === 1 ||
      estado === true
    );

  };


  const estadoPlataforma = (
    estado?: number | boolean
  ) => {

    return estaConectada(estado)
      ? "✓ Conectada"
      : "No conectada";

  };


  // ==========================================
  // INTERFAZ
  // ==========================================

  return (

    <div className="pagina-perfil">

      <div className="perfil-contenedor">


        {/* =====================================
            CABECERA
        ===================================== */}

        <div className="perfil-cabecera">

          <img
            src={fotoPerfil}
            alt="Foto de perfil"
            className="perfil-foto"
          />

          <h1>
            {usuario.nombre}
          </h1>

          <p>
            Usuario de PromoHunt
          </p>

        </div>


        {/* =====================================
            INFORMACIÓN DE USUARIO
        ===================================== */}

        <div className="perfil-seccion">

          <div className="perfil-titulo">

            <h2>
              Información de usuario
            </h2>

            {!editando && (

              <button
                className="boton-editar"
                onClick={comenzarEdicion}
              >
                ✏️ Editar perfil
              </button>

            )}

          </div>


          <div className="perfil-datos">


            {/* ID */}

            <div className="perfil-dato">

              <span>
                ID de usuario
              </span>

              <strong>
                {usuario.id_usuario}
              </strong>

            </div>


            {/* NOMBRE */}

            <div className="perfil-dato">

              <span>
                Nombre de usuario
              </span>

              {editando ? (

                <input
                  type="text"
                  value={nombreEditado}
                  onChange={(e) =>
                    setNombreEditado(
                      e.target.value
                    )
                  }
                  className="input-editar"
                />

              ) : (

                <strong>
                  {usuario.nombre}
                </strong>

              )}

            </div>


            {/* CORREO */}

            <div className="perfil-dato">

              <span>
                Correo electrónico
              </span>

              {editando ? (

                <input
                  type="email"
                  value={correoEditado}
                  onChange={(e) =>
                    setCorreoEditado(
                      e.target.value
                    )
                  }
                  className="input-editar"
                />

              ) : (

                <strong>
                  {usuario.correo}
                </strong>

              )}

            </div>


            {/* CONTRASEÑAS */}

            {editando && (

              <>

                <div className="perfil-dato">

                  <span>
                    Contraseña actual
                  </span>

                  <input
                    type="password"
                    value={contrasenaActual}
                    onChange={(e) =>
                      setContrasenaActual(
                        e.target.value
                      )
                    }
                    placeholder="Contraseña actual"
                    className="input-editar"
                  />

                </div>


                <div className="perfil-dato">

                  <span>
                    Nueva contraseña
                  </span>

                  <input
                    type="password"
                    value={nuevaContrasena}
                    onChange={(e) =>
                      setNuevaContrasena(
                        e.target.value
                      )
                    }
                    placeholder="Nueva contraseña"
                    className="input-editar"
                  />

                </div>

              </>

            )}


            {/* FECHA */}

            <div className="perfil-dato">

              <span>
                Fecha de registro
              </span>

              <strong>
                {usuario.fecha_registro ||
                  "No disponible"}
              </strong>

            </div>


            {/* ROL */}

            <div className="perfil-dato">

              <span>
                Rol
              </span>

              <strong>
                {usuario.rol || "Usuario"}
              </strong>

            </div>


          </div>


          {/* =====================================
              BOTONES DE EDICIÓN
          ===================================== */}

          {editando && (

            <div className="botones-edicion">

              <button
                className="boton-guardar"
                onClick={guardarCambios}
                disabled={guardando}
              >

                {guardando
                  ? "Guardando..."
                  : "💾 Guardar cambios"}

              </button>


              <button
                className="boton-cancelar"
                onClick={cancelarEdicion}
                disabled={guardando}
              >
                Cancelar
              </button>

            </div>

          )}


          {/* =====================================
              MENSAJE
          ===================================== */}

          {mensaje && (

            <p className="mensaje-perfil">
              {mensaje}
            </p>

          )}

        </div>


        {/* =====================================
            PLATAFORMAS
        ===================================== */}

        <div className="perfil-seccion">

          <h2>
            Mis plataformas
          </h2>

          <p className="crossplay-descripcion">
            Plataformas vinculadas a tu cuenta.
          </p>


          <div className="plataformas">


            {/* STEAM */}

            <div className="plataforma">

              <div className="plataforma-nombre">

                <FaSteam />

                <span>
                  Steam
                </span>

              </div>

              <span
                className={
                  estaConectada(
                    crossplay?.steam
                  )
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(
                  crossplay?.steam
                )}
              </span>

            </div>


            {/* EPIC GAMES */}

            <div className="plataforma">

              <div className="plataforma-nombre">

                <span className="icono-texto">
                  🎮
                </span>

                <span>
                  Epic Games
                </span>

              </div>

              <span
                className={
                  estaConectada(
                    crossplay?.epic_games
                  )
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(
                  crossplay?.epic_games
                )}
              </span>

            </div>


            {/* XBOX */}

            <div className="plataforma">

              <div className="plataforma-nombre">

                <FaXbox />

                <span>
                  Xbox
                </span>

              </div>

              <span
                className={
                  estaConectada(
                    crossplay?.xbox_store
                  )
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(
                  crossplay?.xbox_store
                )}
              </span>

            </div>


            {/* PLAYSTATION */}

            <div className="plataforma">

              <div className="plataforma-nombre">

                <FaPlaystation />

                <span>
                  PlayStation
                </span>

              </div>

              <span
                className={
                  estaConectada(
                    crossplay?.playstation_store
                  )
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(
                  crossplay?.playstation_store
                )}
              </span>

            </div>


            {/* RIOT GAMES */}

            <div className="plataforma">

              <div className="plataforma-nombre">

                <span className="icono-texto">
                  🎯
                </span>

                <span>
                  Riot Games
                </span>

              </div>

              <span
                className={
                  estaConectada(
                    crossplay?.riot_games
                  )
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(
                  crossplay?.riot_games
                )}
              </span>

            </div>


          </div>

        </div>


      {/* =====================================
      ADMINISTRACIÓN
      ===================================== */}

{usuario.rol?.toLowerCase() === "admin" && (

  <div className="perfil-botones">

    <button
      onClick={() => navigate("/admin")}
      className="boton-admin"
    >
      ⚙️ Panel de administrador
    </button>

  </div>

)}
              


        {/* =====================================
            CERRAR SESIÓN
        ===================================== */}

        <div className="perfil-botones">

          <button
            onClick={cerrarSesion}
            className="boton-cerrar"
          >
            Cerrar sesión
          </button>

        </div>


      </div>

    </div>

  );

}

export default Perfil;
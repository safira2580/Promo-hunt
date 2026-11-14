import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaSteam,
  FaXbox,
  FaPlaystation
} from "react-icons/fa6";

import "./Perfil.css";
import { API_URL } from "../config";
import { authFetch, getToken, setToken, mensajeDeError } from "../api";

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

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [crossplay, setCrossplay] = useState<Crossplay | null>(null);
  const [cargando, setCargando] = useState(true);

  // EDITAR PERFIL
  const [editando, setEditando] = useState(false);
  const [nombreEditado, setNombreEditado] = useState("");
  const [correoEditado, setCorreoEditado] = useState("");
  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);


  // ==========================================
  // OBTENER PERFIL
  // El backend usa token Bearer (localStorage), no cookies.
  // ==========================================

  useEffect(() => {

    // Sin token no hay sesión: directo al login
    if (!getToken()) {
      navigate("/login");
      return;
    }

    const obtenerPerfil = async () => {

      try {

        const respuesta = await authFetch(`${API_URL}/api/v1/usuario/perfil`);

        const datos = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {

          // Solo un 401 significa que la sesión no es válida
          if (respuesta.status === 401) {
            setToken(null);
            navigate("/login");
            return;
          }

          console.error("Error obteniendo perfil:", respuesta.status, datos);
          setMensaje(mensajeDeError(datos, "No se pudo cargar el perfil"));
          setCargando(false);
          return;
        }

        // Admite { usuario, crossplay } o el usuario directamente
        const u: Usuario = datos.usuario ?? datos;

        setUsuario(u);
        setCrossplay(datos.crossplay ?? null);

        // Datos iniciales para edición
        setNombreEditado(u.nombre);
        setCorreoEditado(u.correo);

        setCargando(false);

      } catch (error) {

        console.error("Error obteniendo perfil:", error);
        setMensaje("No se pudo conectar con el servidor");
        setCargando(false);

      }

    };

    obtenerPerfil();

  }, [navigate]);


  // ==========================================
  // ACTIVAR / CANCELAR EDICIÓN
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
      setMensaje("El nombre de usuario no puede estar vacío");
      return;
    }

    if (!correoEditado.trim()) {
      setMensaje("El correo no puede estar vacío");
      return;
    }

    // Si quiere cambiar contraseña, debe llenar ambos campos
    if (nuevaContrasena && !contrasenaActual) {
      setMensaje("Debes ingresar tu contraseña actual");
      return;
    }

    if (contrasenaActual && !nuevaContrasena) {
      setMensaje("Debes ingresar la nueva contraseña");
      return;
    }

    setMensaje("");
    setGuardando(true);

    try {

      const respuesta = await authFetch(`${API_URL}/api/v1/usuario/editar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreEditado.trim(),
          correo: correoEditado.trim(),
          contrasena_actual: contrasenaActual,
          nueva_contrasena: nuevaContrasena
        })
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {

        if (respuesta.status === 401 && !contrasenaActual) {
          // Token vencido o inválido
          setToken(null);
          navigate("/login");
          return;
        }

        setMensaje(mensajeDeError(datos, "No se pudieron guardar los cambios"));
        setGuardando(false);
        return;

      }

      // ACTUALIZAR DATOS EN PANTALLA
      setUsuario({
        ...usuario,
        nombre: nombreEditado.trim(),
        correo: correoEditado.trim()
      });

      // LIMPIAR CONTRASEÑAS
      setContrasenaActual("");
      setNuevaContrasena("");

      setMensaje("Perfil actualizado correctamente ✓");
      setEditando(false);

    } catch (error) {

      console.error("Error actualizando perfil:", error);
      setMensaje("No se pudo conectar con el servidor");

    }

    setGuardando(false);

  };


  // ==========================================
  // CERRAR SESIÓN
  // El backend no tiene /logout: el token vive en el navegador,
  // así que basta con descartarlo y recargar.
  // ==========================================

  const cerrarSesion = () => {

    setToken(null);
    window.location.assign("/");

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

    return mensaje ? (
      <div className="perfil-cargando">{mensaje}</div>
    ) : null;

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

  const estaConectada = (estado?: number | boolean) => {
    return estado === 1 || estado === true;
  };

  const estadoPlataforma = (estado?: number | boolean) => {
    return estaConectada(estado) ? "✓ Conectada" : "No conectada";
  };


  // ==========================================
  // INTERFAZ
  // ==========================================

  return (

    <div className="pagina-perfil">

      <div className="perfil-contenedor">

        {/* CABECERA */}

        <div className="perfil-cabecera">

          <img
            src={fotoPerfil}
            alt="Foto de perfil"
            className="perfil-foto"
          />

          <h1>{usuario.nombre}</h1>

          <p>Usuario de PromoHunt</p>

        </div>


        {/* INFORMACIÓN DE USUARIO */}

        <div className="perfil-seccion">

          <div className="perfil-titulo">

            <h2>Información de usuario</h2>

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
              <span>ID de usuario</span>
              <strong>{usuario.id_usuario}</strong>
            </div>


            {/* NOMBRE */}

            <div className="perfil-dato">

              <span>Nombre de usuario</span>

              {editando ? (

                <input
                  type="text"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  className="input-editar"
                />

              ) : (

                <strong>{usuario.nombre}</strong>

              )}

            </div>


            {/* CORREO */}

            <div className="perfil-dato">

              <span>Correo electrónico</span>

              {editando ? (

                <input
                  type="email"
                  value={correoEditado}
                  onChange={(e) => setCorreoEditado(e.target.value)}
                  className="input-editar"
                />

              ) : (

                <strong>{usuario.correo}</strong>

              )}

            </div>


            {/* CONTRASEÑAS */}

            {editando && (

              <>

                <div className="perfil-dato">

                  <span>Contraseña actual</span>

                  <input
                    type="password"
                    value={contrasenaActual}
                    onChange={(e) => setContrasenaActual(e.target.value)}
                    placeholder="Contraseña actual"
                    className="input-editar"
                  />

                </div>


                <div className="perfil-dato">

                  <span>Nueva contraseña</span>

                  <input
                    type="password"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                    placeholder="Nueva contraseña"
                    className="input-editar"
                  />

                </div>

              </>

            )}


            {/* FECHA */}

            <div className="perfil-dato">

              <span>Fecha de registro</span>

              <strong>
                {usuario.fecha_registro || "No disponible"}
              </strong>

            </div>


            {/* ROL */}

            <div className="perfil-dato">

              <span>Rol</span>

              <strong>{usuario.rol || "Usuario"}</strong>

            </div>

          </div>


          {/* BOTONES DE EDICIÓN */}

          {editando && (

            <div className="botones-edicion">

              <button
                className="boton-guardar"
                onClick={guardarCambios}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "💾 Guardar cambios"}
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


          {/* MENSAJE */}

          {mensaje && (

            <p className="mensaje-perfil">
              {mensaje}
            </p>

          )}

        </div>


        {/* PLATAFORMAS */}

        <div className="perfil-seccion">

          <h2>Mis plataformas</h2>

          <p className="crossplay-descripcion">
            Plataformas vinculadas a tu cuenta.
          </p>

          <div className="plataformas">

            {/* STEAM */}

            <div className="plataforma">

              <div className="plataforma-nombre">
                <FaSteam />
                <span>Steam</span>
              </div>

              <span
                className={
                  estaConectada(crossplay?.steam)
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(crossplay?.steam)}
              </span>

            </div>


            {/* EPIC GAMES */}

            <div className="plataforma">

              <div className="plataforma-nombre">
                <span className="icono-texto">🎮</span>
                <span>Epic Games</span>
              </div>

              <span
                className={
                  estaConectada(crossplay?.epic_games)
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(crossplay?.epic_games)}
              </span>

            </div>


            {/* XBOX */}

            <div className="plataforma">

              <div className="plataforma-nombre">
                <FaXbox />
                <span>Xbox</span>
              </div>

              <span
                className={
                  estaConectada(crossplay?.xbox_store)
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(crossplay?.xbox_store)}
              </span>

            </div>


            {/* PLAYSTATION */}

            <div className="plataforma">

              <div className="plataforma-nombre">
                <FaPlaystation />
                <span>PlayStation</span>
              </div>

              <span
                className={
                  estaConectada(crossplay?.playstation_store)
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(crossplay?.playstation_store)}
              </span>

            </div>


            {/* RIOT GAMES */}

            <div className="plataforma">

              <div className="plataforma-nombre">
                <span className="icono-texto">🎯</span>
                <span>Riot Games</span>
              </div>

              <span
                className={
                  estaConectada(crossplay?.riot_games)
                    ? "estado conectado"
                    : "estado"
                }
              >
                {estadoPlataforma(crossplay?.riot_games)}
              </span>

            </div>

          </div>

        </div>


        {/* ADMINISTRACIÓN */}

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


        {/* CERRAR SESIÓN */}

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

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa6";

import "./Login.css";
import { API_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setMensaje(mensajeDeError(datos, "Correo o contraseña incorrectos"));
        setCargando(false);
        return;
      }

      setToken(datos.access_token);

      // Recarga completa para que el Header vuelva a consultar la sesión
      const destino = (location.state as { desde?: string } | null)?.desde ?? "/";
      window.location.assign(destino);
      return;
    } catch (error) {
      console.error("Error iniciando sesión:", error);
      setMensaje("No se pudo conectar con el servidor");
    }

    setCargando(false);
  };
return (
    <section className="login-page">
      <div className="wrapper">

        <form onSubmit={iniciarSesion}>

          <h1>Login</h1>

          <div className="input-box">
            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <FaUser />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />

            <FaLock />
          </div>

          <div className="remember-forgot">

            <label>
              <input type="checkbox" />
              {" "}Recuérdame
            </label>

            <a href="#">
              ¿Olvidaste tu contraseña?
            </a>

          </div>

          {mensaje && (
            <div className="error">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            className="btn"
            disabled={cargando}
          >
            {cargando
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>

          <div className="register-link">

  <p>

    ¿No tienes una cuenta?

    {" "}

    <a
      href="#"
      onClick={(e) => {

        e.preventDefault();

        navigate("/registro");

      }}
    >
      Regístrate
    </a>

  </p>

</div>

        </form>

      </div>
    </section>
  );
}

export default Login;
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa6";

import "./Login.css";
import { API_URL } from "../config";
import { mensajeDeError } from "../api";

export default function RecuperarContrasena() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async (e: FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!correo.trim()) {
      setError("Digite su correo");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/recuperar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(mensajeDeError(data, "Ese correo no existe"));
        setEnviando(false);
        return;
      }

      setMensaje(data.mensaje || "Te enviamos un enlace a tu correo.");
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="login-page">
      <div className="wrapper">
        <form onSubmit={manejarEnvio}>
          <h1>Recuperar</h1>

          <div className="input-box">
            <input
              type="email"
              placeholder="Digite su correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <FaEnvelope />
          </div>

          {error && <div className="error">{error}</div>}
          {mensaje && <div className="error">{mensaje}</div>}

          <button type="submit" className="btn" disabled={enviando}>
            {enviando ? "Verificando..." : "Enviar enlace"}
          </button>

          <div className="register-link">
            <p>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Volver al login
              </a>
              {" · "}
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
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaLock } from "react-icons/fa6";

import "./Login.css";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [correo, setCorreo] = useState("");
  const [tokenValido, setTokenValido] = useState(false);
  const [verificando, setVerificando] = useState(true);

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Falta el token de recuperación en el enlace.");
      setVerificando(false);
      return;
    }

    let activo = true;
    fetch(`${API_BASE}/api/v1/auth/validar-token-reset?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.detail || "El enlace no es válido o expiró.");
        }
        if (activo) {
          setCorreo(data.correo || "");
          setTokenValido(true);
        }
      })
      .catch((err: unknown) => {
        if (activo) {
          setError(err instanceof Error ? err.message : "Enlace no válido.");
        }
      })
      .finally(() => {
        if (activo) setVerificando(false);
      });

    return () => {
      activo = false;
    };
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/restablecer-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          contrasena_actual: contrasenaActual,
          nueva_contrasena: nuevaContrasena,
          confirmar_contrasena: confirmarContrasena,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "No se pudo actualizar la contraseña.");
      }
      setMensaje(data.mensaje || "Contraseña actualizada correctamente.");
      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="login-page">
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Cambiar contraseña</h1>

          {verificando && (
            <div className="register-link">
              <p>Validando enlace...</p>
            </div>
          )}

          {correo && (
            <div className="register-link">
              <p>
                Cuenta a actualizar: <strong>{correo}</strong>
              </p>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {mensaje && (
            <div className="register-link">
              <p>{mensaje}</p>
            </div>
          )}

          {!verificando && tokenValido && (
            <>
              <div className="input-box">
                <input
                  type="password"
                  placeholder="Digite su contraseña actual"
                  value={contrasenaActual}
                  onChange={(e) => setContrasenaActual(e.target.value)}
                  required
                />
                <FaLock />
              </div>

              <div className="input-box">
                <input
                  type="password"
                  placeholder="Nueva contraseña"
                  value={nuevaContrasena}
                  onChange={(e) => setNuevaContrasena(e.target.value)}
                  required
                />
                <FaLock />
              </div>

              <div className="input-box">
                <input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                />
                <FaLock />
              </div>

              <button type="submit" className="btn" disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </>
          )}

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
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
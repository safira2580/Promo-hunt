import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#090d16",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "32px",
          borderRadius: "14px",
          background: "rgba(15, 23, 42, 0.92)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "16px" }}>Cambiar contraseña</h1>

        {verificando && <p>Validando enlace...</p>}

        {correo && (
          <p style={{ marginBottom: "14px", fontSize: "0.9rem", color: "#cbd5e1" }}>
            Cuenta a actualizar: <strong>{correo}</strong>
          </p>
        )}

        {error && (
          <div
            style={{
              marginBottom: "14px",
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.18)",
              color: "#fca5a5",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {mensaje && (
          <div
            style={{
              marginBottom: "14px",
              padding: "10px",
              borderRadius: "8px",
              background: "rgba(34, 197, 94, 0.18)",
              color: "#86efac",
              fontSize: "0.9rem",
            }}
          >
            {mensaje}
          </div>
        )}

        {!verificando && tokenValido && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <input
                type="password"
                placeholder="Digite su contraseña actual"
                value={contrasenaActual}
                onChange={(e) => setContrasenaActual(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                }}
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#fff",
                background: "linear-gradient(90deg, #1CB5E0, #020286)",
              }}
            >
              {enviando ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
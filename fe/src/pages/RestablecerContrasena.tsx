import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../config";
import { mensajeDeError } from "../api";

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [verificandoToken, setVerificandoToken] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [correoCuenta, setCorreoCuenta] = useState("");

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerificandoToken(false);
      setTokenValido(false);
      return;
    }

    fetch(`${API_URL}/api/v1/auth/validar-token-reset?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.valido) {
          setTokenValido(false);
        } else {
          setTokenValido(true);
          setCorreoCuenta(data.correo || "");
        }
      })
      .catch(() => setTokenValido(false))
      .finally(() => setVerificandoToken(false));
  }, [token]);

  const manejarCambio = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!contrasenaActual) {
      setError("Digite su contraseña actual");
      return;
    }
    if (nuevaContrasena.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setError("La nueva contraseña y la confirmación no coinciden");
      return;
    }

    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/restablecer-password`, {
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
        setError(mensajeDeError(data, "No se pudo actualizar la contraseña"));
        setGuardando(false);
        return;
      }

      setMensaje("Contraseña actualizada correctamente. Redirigiendo al login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch {
      setError("No se pudo conectar con el servidor");
    } finally {
      setGuardando(false);
    }
  };

  if (verificandoToken) {
    return <div className="reset-container">Validando enlace...</div>;
  }

  if (!tokenValido) {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <h2>Acceso restringido</h2>
          <p>Solo puedes acceder a esta página desde el enlace enviado a tu correo.</p>
          <button type="button" onClick={() => navigate("/recuperar-contrasena")}>
            Solicitar nuevo enlace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2>Cambiar contraseña</h2>
        {correoCuenta && (
          <p className="reset-cuenta">
            Cuenta a actualizar: <strong>{correoCuenta}</strong>
          </p>
        )}

        <form onSubmit={manejarCambio}>
          <div className="form-field">
            <label>Contraseña actual</label>
            <input
              type="password"
              placeholder="Digite su contraseña actual"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Nueva contraseña</label>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              required
            />
          </div>

          {error && <p className="reset-error">{error}</p>}
          {mensaje && <p className="reset-success">{mensaje}</p>}

          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
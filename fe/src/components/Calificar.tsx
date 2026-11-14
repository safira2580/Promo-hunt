import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { API_URL } from "../config";
import { authFetch, getToken, mensajeDeError } from "../api";
import "./Calificar.css";

function Calificar({ idJuego }: { idJuego: number }) {
  const navigate = useNavigate();
  const [valor, setValor] = useState(0);
  const [sobre, setSobre] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  if (!getToken()) {
    return (
      <div className="calificar">
        <h3>Califica este juego</h3>
        <p className="calificar-ayuda">Inicia sesión para dejar tu calificación.</p>
        <button className="boton-principal" type="button" onClick={() => navigate("/login")}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (valor < 1) {
      setMensaje({ ok: false, texto: "Elige de 1 a 5 estrellas." });
      return;
    }
    setEnviando(true);
    setMensaje(null);
    try {
      const r = await authFetch(`${API_URL}/api/v1/resenas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_juego: idJuego, calificacion: valor, comentario }),
      });
      const datos = await r.json().catch(() => ({}));
      if (r.ok) {
        setMensaje({ ok: true, texto: "¡Gracias! Tu calificación quedó guardada." });
        setComentario("");
      } else if (r.status === 401) {
        setMensaje({ ok: false, texto: "Tu sesión venció. Inicia sesión de nuevo." });
      } else {
        setMensaje({ ok: false, texto: mensajeDeError(datos, "No se pudo guardar la calificación.") });
      }
    } catch {
      setMensaje({ ok: false, texto: "No se pudo conectar con el servidor." });
    }
    setEnviando(false);
  };

  return (
    <form className="calificar" onSubmit={enviar}>
      <h3>Califica este juego</h3>
      <div className="calificar-estrellas" onMouseLeave={() => setSobre(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onMouseEnter={() => setSobre(n)}
            onClick={() => setValor(n)}
          >
            {n <= (sobre || valor) ? <FaStar /> : <FaRegStar />}
          </button>
        ))}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Cuéntanos qué te pareció (opcional)"
        rows={3}
        maxLength={1000}
      />
      <button className="boton-principal" type="submit" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar calificación"}
      </button>
      {mensaje && <p className={mensaje.ok ? "msg-ok" : "msg-error"}>{mensaje.texto}</p>}
    </form>
  );
}

export default Calificar;

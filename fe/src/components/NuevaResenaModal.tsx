import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { apiFetch } from "../api";

interface JuegoOpcion {
  id_juego: number;
  nombre: string;
}

interface Props {
  onClose: () => void;
  onCreada: () => void;
}

export default function NuevaResenaModal({ onClose, onCreada }: Props) {
  const [juegos, setJuegos] = useState<JuegoOpcion[]>([]);
  const [idJuego, setIdJuego] = useState<number | "">("");
  const [nota, setNota] = useState(0);
  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    apiFetch("/api/v1/juegos-lista")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setJuegos)
      .catch(() => setError("No se pudieron cargar los juegos."));
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (idJuego === "") return setError("Elige un juego.");
    if (nota < 1) return setError("Elige una calificación de 1 a 5.");
    setError("");
    setEnviando(true);
    try {
      const r = await apiFetch("/api/v1/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_juego: idJuego, calificacion: nota, titulo, comentario }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.detail || "No se pudo guardar la reseña.");
      }
      onCreada();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="modal-resena-fondo" onClick={onClose}>
      <form className="modal-resena" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h2>Nueva reseña</h2>

        <label>
          Juego
          <select value={idJuego} onChange={(e) => setIdJuego(e.target.value ? Number(e.target.value) : "")}>
            <option value="">Selecciona un juego...</option>
            {juegos.map((j) => (
              <option key={j.id_juego} value={j.id_juego}>
                {j.nombre}
              </option>
            ))}
          </select>
        </label>

        <div className="modal-resena-estrellas">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setNota(n)} aria-label={`${n} estrellas`}>
              {n <= nota ? <FaStar /> : <FaRegStar />}
            </button>
          ))}
        </div>

        <label>
          Título (opcional)
          <input value={titulo} maxLength={100} onChange={(e) => setTitulo(e.target.value)} />
        </label>

        <label>
          Comentario
          <textarea rows={4} maxLength={1000} value={comentario} onChange={(e) => setComentario(e.target.value)} />
        </label>

        {error && <p className="modal-resena-error">{error}</p>}

        <div className="modal-resena-acciones">
          <button type="button" className="btn-cancelar" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="boton-nueva-resena" disabled={enviando}>
            {enviando ? "Guardando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}

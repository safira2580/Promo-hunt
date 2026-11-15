import { useEffect, useState, type FormEvent } from "react";
import { API_URL } from "../config";
import { authFetch, mensajeDeError, setToken } from "../api";
import "./FormularioResena.css";

interface JuegoOpcion {
  id_juego: number;
  nombre: string;
}

interface Props {
  /** Juego preseleccionado (por ejemplo, al abrirlo desde la ficha de un juego) */
  juegoInicial?: number | null;
  onCerrar: () => void;
  /** Se llama tras publicar, para que la página recargue sus reseñas */
  onPublicada: () => void;
}

function FormularioResena({ juegoInicial = null, onCerrar, onPublicada }: Props) {

  const [juegos, setJuegos] = useState<JuegoOpcion[]>([]);
  const [idJuego, setIdJuego] = useState(juegoInicial ? String(juegoInicial) : "");
  const [titulo, setTitulo] = useState("");
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);


  // Lista de juegos para el selector
  useEffect(() => {

    fetch(`${API_URL}/api/v1/juegos-lista`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((datos) => setJuegos(Array.isArray(datos) ? datos : []))
      .catch((e) => {
        console.error("Error cargando juegos:", e);
        setError("No se pudo cargar la lista de juegos");
      });

  }, []);


  // Cerrar con la tecla Escape
  useEffect(() => {

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };

    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);

  }, [onCerrar]);


  const enviar = async (e: FormEvent) => {

    e.preventDefault();

    if (!idJuego) {
      setError("Elige el juego que quieres reseñar");
      return;
    }

    if (calificacion < 1) {
      setError("Elige una calificación de 1 a 5 estrellas");
      return;
    }

    setError("");
    setEnviando(true);

    try {

      const respuesta = await authFetch(`${API_URL}/api/v1/resenas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_juego: Number(idJuego),
          titulo: titulo.trim(),
          comentario: comentario.trim(),
          calificacion,
        }),
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {

        if (respuesta.status === 401) {
          setToken(null);
          setError("Tu sesión expiró. Inicia sesión de nuevo para escribir una reseña.");
        } else {
          setError(mensajeDeError(datos, "No se pudo publicar la reseña"));
        }

        setEnviando(false);
        return;

      }

      setExito(true);
      onPublicada();
      setTimeout(onCerrar, 1200);

    } catch (err) {

      console.error("Error publicando reseña:", err);
      setError("No se pudo conectar con el servidor");

    }

    setEnviando(false);

  };


  return (

    <div
      className="resena-modal-fondo"
      onMouseDown={(e) => {
        // Solo si se hace clic en el fondo, no dentro del cuadro
        if (e.target === e.currentTarget) onCerrar();
      }}
    >

      <div className="resena-modal" role="dialog" aria-modal="true" aria-labelledby="resena-modal-titulo">

        <div className="resena-modal-cabecera">

          <h2 id="resena-modal-titulo">✍️ Escribir reseña</h2>

          <button
            type="button"
            className="resena-modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>

        </div>


        {exito ? (

          <p className="resena-modal-exito">¡Gracias! Tu reseña se publicó correctamente ✅</p>

        ) : (

          <form onSubmit={enviar}>

            <label className="resena-campo">
              Juego
              <select value={idJuego} onChange={(e) => setIdJuego(e.target.value)} required>
                <option value="">Selecciona un juego</option>
                {juegos.map((j) => (
                  <option key={j.id_juego} value={j.id_juego}>
                    {j.nombre}
                  </option>
                ))}
              </select>
            </label>

            <div className="resena-campo">
              Calificación
              <div className="resena-estrellas">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={n <= calificacion ? "activa" : ""}
                    onClick={() => setCalificacion(n)}
                    aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <label className="resena-campo">
              Título
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={150}
                placeholder="Resume tu opinión en una frase"
                required
              />
            </label>

            <label className="resena-campo">
              Tu reseña
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="Cuéntanos qué te pareció el juego"
                required
              />
              <small>{comentario.length}/2000</small>
            </label>

            {error && <p className="resena-modal-error">{error}</p>}

            <div className="resena-modal-acciones">

              <button type="button" className="resena-boton-cancelar" onClick={onCerrar} disabled={enviando}>
                Cancelar
              </button>

              <button type="submit" className="resena-boton-publicar" disabled={enviando}>
                {enviando ? "Publicando..." : "Publicar reseña"}
              </button>

            </div>

          </form>

        )}

      </div>

    </div>

  );

}

export default FormularioResena;

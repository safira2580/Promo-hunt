import { useEffect, useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { API_URL } from "../config";
import { imagenJuego } from "../imagenJuego";
import "./Calificar.css";

interface Resena {
  id_resena: number | string;
  usuario: string;
  juego: string;
  imagen?: string | null;
  titulo?: string | null;
  comentario?: string | null;
  calificacion?: number | null;
}

function MejoresResenas() {
  const [lista, setLista] = useState<Resena[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/resenas/mejores`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setLista)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="mejores-resenas">
      <h4>Las 10 mejor calificadas</h4>
      {!lista && !error && <p className="calificar-ayuda">Cargando reseñas...</p>}
      {error && <p className="msg-error">No se pudieron cargar las reseñas.</p>}
      {lista && lista.length === 0 && <p className="calificar-ayuda">Aún no hay reseñas.</p>}
      <ol>
        {lista?.map((r) => (
          <li key={r.id_resena}>
            <img src={imagenJuego(r.juego, r.imagen)} alt="" />
            <div>
              <strong>{r.juego}</strong>
              <span className="mejores-estrellas">
                {[1, 2, 3, 4, 5].map((n) => (n <= (r.calificacion ?? 0) ? <FaStar key={n} /> : <FaRegStar key={n} />))}
              </span>
              {r.comentario && <p>{r.comentario}</p>}
              <small>{r.usuario}</small>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default MejoresResenas;

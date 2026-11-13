import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaRegStar, FaArrowLeft } from "react-icons/fa6";
import { API_URL } from "../config";
import { imagenJuego } from "../imagenJuego.ts";
import "../components/Extras.css";

interface Resena {
  id_resena: number;
  usuario: string;
  id_juego: number;
  juego: string;
  imagen: string | null;
  titulo: string | null;
  comentario: string | null;
  calificacion: number | null;
  fecha_publicacion: string | null;
}

function Estrellas({ valor }: { valor: number }) {
  return (
    <span className="estrellas" aria-label={`${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (n <= valor ? <FaStar key={n} /> : <FaRegStar key={n} />))}
    </span>
  );
}

function Resenas() {
  const navigate = useNavigate();
  const [resenas, setResenas] = useState<Resena[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/resenas`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setResenas)
      .catch(() => setError(true));
  }, []);

  return (
    <section className="container pagina-extra">
      <button className="boton-volver" type="button" onClick={() => navigate("/")}>
        <FaArrowLeft /> Volver
      </button>
      <h1 className="heading-1">Reseñas mundiales</h1>

      {error && <p className="estado-vacio">No se pudieron cargar las reseñas. Revisa que el backend esté corriendo.</p>}
      {!error && resenas === null && <p className="estado-vacio">Cargando reseñas...</p>}
      {resenas && resenas.length === 0 && <p className="estado-vacio">Todavía no hay reseñas.</p>}

      <div className="lista-resenas">
        {resenas?.map((r) => (
          <article className="resena-card" key={r.id_resena}>
            <header>
              <div
                className="resena-juego"
                onClick={() => navigate(`/juego/${r.id_juego}`)}
                style={{ cursor: "pointer" }}
              >
                <img className="resena-img" src={imagenJuego(r.juego, r.imagen)} alt={r.juego} />
                <h3>{r.juego}</h3>
              </div>
              <Estrellas valor={r.calificacion ?? 0} />
            </header>
            {r.titulo && <strong>{r.titulo}</strong>}
            {r.comentario && <p>{r.comentario}</p>}
            <footer>
              {r.usuario}
              {r.fecha_publicacion && ` · ${new Date(r.fecha_publicacion).toLocaleDateString("es-CO")}`}
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Resenas;

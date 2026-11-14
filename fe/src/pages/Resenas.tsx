import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { API_URL } from "../config";
import "../components/Extras.css";
import "./ResenasFiltros.css";

interface Resena {
  id_resena: number;
  id_juego: number;
  juego: string;
  id_categoria: number | null;
  categoria: string | null;
  usuario: string;
  titulo: string | null;
  comentario: string | null;
  calificacion: number;
  fecha_publicacion: string | null;
}

const estrellas = (n: number) => "⭐".repeat(Math.max(0, Math.min(5, n || 0)));

function Resenas() {

  const navigate = useNavigate();

  const [resenas, setResenas] = useState<Resena[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  // Los dos filtros son independientes: cada uno se puede usar solo o combinado
  const [categoria, setCategoria] = useState("");
  const [juego, setJuego] = useState("");


  // ==========================================
  // CARGAR RESEÑAS
  // ==========================================

  useEffect(() => {

    fetch(`${API_URL}/api/v1/resenas`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((datos) => setResenas(Array.isArray(datos) ? datos : []))
      .catch((e) => {
        console.error("Error cargando reseñas:", e);
        setError(true);
      })
      .finally(() => setCargando(false));

  }, []);


  // ==========================================
  // OPCIONES DE LOS FILTROS
  // Salen de las propias reseñas, así que nunca hay una opción sin resultados.
  // La lista de juegos NO depende de la categoría elegida.
  // ==========================================

  const categorias = useMemo(() => {
    const mapa = new Map<number, string>();
    resenas.forEach((r) => {
      if (r.id_categoria != null && r.categoria) mapa.set(r.id_categoria, r.categoria);
    });
    return Array.from(mapa.entries()).sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [resenas]);

  const juegos = useMemo(() => {
    const mapa = new Map<number, string>();
    resenas.forEach((r) => mapa.set(r.id_juego, r.juego));
    return Array.from(mapa.entries()).sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [resenas]);


  // ==========================================
  // FILTRADO
  // ==========================================

  const visibles = resenas.filter(
    (r) =>
      (categoria === "" || String(r.id_categoria) === categoria) &&
      (juego === "" || String(r.id_juego) === juego)
  );

  const hayFiltros = categoria !== "" || juego !== "";


  // ==========================================
  // INTERFAZ
  // ==========================================

  return (

    <section className="container pagina-extra">

      <button className="boton-volver" type="button" onClick={() => navigate("/")}>
        <FaArrowLeft /> Volver
      </button>

      <h1 className="heading-1">Reseñas mundiales</h1>

      <p className="texto-ayuda">
        Opiniones de jugadores de todo el mundo. Filtra por categoría, por juego o por ambos.
      </p>


      {cargando && <p className="texto-ayuda">Cargando reseñas...</p>}

      {error && (
        <div className="estado-vacio">
          <p>No se pudieron cargar las reseñas. Inténtalo de nuevo en un momento.</p>
        </div>
      )}


      {!cargando && !error && (

        <>

          {/* FILTROS */}

          <div className="filtros-resenas">

            <label>
              Categoría
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Juego
              <select value={juego} onChange={(e) => setJuego(e.target.value)}>
                <option value="">Todos los juegos</option>
                {juegos.map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </label>

            {hayFiltros && (
              <button
                type="button"
                className="filtros-limpiar"
                onClick={() => {
                  setCategoria("");
                  setJuego("");
                }}
              >
                Limpiar filtros
              </button>
            )}

          </div>

          <p className="filtros-contador">
            {visibles.length} {visibles.length === 1 ? "reseña" : "reseñas"}
          </p>


          {/* LISTA */}

          {visibles.length === 0 ? (

            <div className="estado-vacio">
              <p>
                {hayFiltros
                  ? "No hay reseñas con esos filtros."
                  : "Todavía no hay reseñas."}
              </p>
            </div>

          ) : (

            <div className="lista-resenas">

              {visibles.map((r) => (

                <article className="resena-card" key={r.id_resena}>

                  <header>
                    <h3>{r.titulo || r.juego}</h3>
                    <span className="etiqueta-estado">{estrellas(r.calificacion)}</span>
                  </header>

                  <p className="resena-meta">
                    <strong>{r.juego}</strong>
                    {r.categoria ? ` · ${r.categoria}` : ""}
                  </p>

                  {r.comentario && <p>{r.comentario}</p>}

                  <footer>
                    {r.usuario}
                    {r.fecha_publicacion
                      ? ` · ${new Date(r.fecha_publicacion).toLocaleDateString("es-CO")}`
                      : ""}
                  </footer>

                </article>

              ))}

            </div>

          )}

        </>

      )}

    </section>

  );

}

export default Resenas;

import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaXmark } from "react-icons/fa6";
import { items } from "./featuresData";
import "./Extras.css";


function Features() {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    if (abierto === null) return;
    const cerrar = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setAbierto(null);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);

  const tecla = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setAbierto(i);
    }
  };

  const actual = abierto === null ? null : items[abierto];
  const accion = actual?.accion;

  return (
    <>
      <section className="container container-features">
        {items.map((it, i) => (
          <div
            key={it.titulo}
            className="card-feature"
            role="button"
            tabIndex={0}
            onClick={() => setAbierto(i)}
            onKeyDown={(e) => tecla(e, i)}
          >
            {it.icono}
            <div className="feature-content">
              <span>{it.titulo}</span>
              <p>{it.resumen}</p>
            </div>
          </div>
        ))}
      </section>

      {actual && (
        <div className="modal-fondo" onClick={() => setAbierto(null)}>
          <div
            className="modal-caja"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-cerrar" type="button" aria-label="Cerrar" onClick={() => setAbierto(null)}>
              <FaXmark />
            </button>
            <span className="modal-icono">{actual.icono}</span>
            <h3 id="modal-titulo">{actual.titulo}</h3>
            <p>{actual.parrafo}</p>
            <ul>
              {actual.puntos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            {accion && (
              <button
                className="modal-accion"
                type="button"
                onClick={() => {
                  setAbierto(null);
                  navigate(accion.ruta);
                }}
              >
                {accion.texto}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Features;

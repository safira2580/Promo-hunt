import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaXmark, FaNewspaper } from "react-icons/fa6";
import "./Extras.css";
import "./LeerMas.css";

interface Noticia {
  titulo: string;
  fecha?: string;
  contenido?: string;
  imagen?: string;
}

function LeerMas({ noticia }: { noticia: Noticia }) {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);

  return (
    <>
      <button className="btn-leer-mas" type="button" onClick={() => setAbierto(true)}>
        Leer más
      </button>

      {abierto &&
        createPortal(
          <div className="modal-fondo" onClick={() => setAbierto(false)}>
            <div
              className="modal-caja noticia-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="noticia-titulo"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-cerrar" type="button" aria-label="Cerrar" onClick={() => setAbierto(false)}>
                <FaXmark />
              </button>
              <span className="modal-icono">
                <FaNewspaper />
              </span>
              <h3 id="noticia-titulo">{noticia.titulo}</h3>
              {noticia.fecha && <p className="noticia-fecha">{noticia.fecha}</p>}
              {noticia.imagen && <img className="noticia-img" src={noticia.imagen} alt={noticia.titulo} />}
              {noticia.contenido && <p>{noticia.contenido}</p>}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default LeerMas;

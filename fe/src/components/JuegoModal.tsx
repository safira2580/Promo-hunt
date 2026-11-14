import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaXmark, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { API_URL } from "../config";
import { imagenJuego } from "../imagenJuego";
import { urlTiendaJuego } from "../tiendas";
import "./Extras.css";

interface Oferta {
  id_descuento: number;
  precio_original: number;
  precio_descuento: number;
  porcentaje_descuento: number;
  plataforma: string;
  url_tienda?: string | null;
}

interface Detalle {
  juego: {
    id_juego: number;
    nombre: string;
    descripcion?: string | null;
    fecha_lanzamiento?: string | null;
    imagen?: string | null;
  };
  descuentos: Oferta[];
}

interface Props {
  idJuego: number;
  nombre: string;
  imagen?: string | null;
  // true: pantalla grande con imagen, descripción y tiendas. false: solo la lista de tiendas.
  completo: boolean;
  onCerrar: () => void;
}

const precio = (n: number) => (Number(n) === 0 ? "Gratis" : `$${Number(n).toFixed(2)}`);

function JuegoModal({ idJuego, nombre, imagen, completo, onCerrar }: Props) {
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    fetch(`${API_URL}/api/v1/juegos/${idJuego}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Detalle) => activo && setDetalle(d))
      .catch(() => activo && setError(true));
    return () => {
      activo = false;
    };
  }, [idJuego]);

  useEffect(() => {
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", cerrar);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", cerrar);
    };
  }, [onCerrar]);

  const ofertas = detalle?.descuentos ?? [];
  const juego = detalle?.juego;
  const titulo = juego?.nombre ?? nombre;
  const fecha = juego?.fecha_lanzamiento
    ? new Date(juego.fecha_lanzamiento).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : null;

  return createPortal(
    <div className="jm-fondo" onClick={onCerrar}>
      <div
        className={`jm-caja${completo ? " jm-completo" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="jm-cerrar" type="button" aria-label="Cerrar" onClick={onCerrar}>
          <FaXmark />
        </button>

        {completo && (
          <div className="jm-imagen">
            <img src={imagenJuego(titulo, juego?.imagen ?? imagen)} alt={titulo} />
          </div>
        )}

        <div className="jm-info">
          <h2>{titulo}</h2>
          {completo && fecha && <p className="jm-fecha">Lanzamiento: {fecha}</p>}
          {completo && (
            <p className="jm-desc">
              {detalle
                ? juego?.descripcion?.trim() || "Este juego aún no tiene descripción."
                : error
                  ? ""
                  : "Cargando descripción..."}
            </p>
          )}

          <h3 className="jm-subtitulo">
            {ofertas.length > 1 ? `Disponible en ${ofertas.length} tiendas` : "Disponible en"}
          </h3>

          {!detalle && !error && <p className="jm-vacio">Cargando tiendas...</p>}
          {error && <p className="jm-vacio">No se pudo cargar la información. Intenta de nuevo.</p>}
          {detalle && ofertas.length === 0 && <p className="jm-vacio">Por ahora no hay tiendas con oferta activa.</p>}

          <ul className="jm-tiendas">
            {ofertas.map((o) => {
              const url = urlTiendaJuego(o.plataforma, titulo, o.url_tienda);
              return (
                <li key={o.id_descuento} className="jm-tienda">
                  <div className="jm-tienda-nombre">
                    <strong>{o.plataforma}</strong>
                    <span className="jm-etiqueta">-{Math.round(Number(o.porcentaje_descuento))}%</span>
                  </div>
                  <div className="jm-tienda-precio">
                    <b>{precio(o.precio_descuento)}</b>
                    <s>{precio(o.precio_original)}</s>
                  </div>
                  {url ? (
                    <a className="jm-ir" href={url} target="_blank" rel="noopener noreferrer">
                      Ir a la tienda <FaArrowUpRightFromSquare />
                    </a>
                  ) : (
                    <span className="jm-ir jm-ir-off">Sin enlace</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default JuegoModal;

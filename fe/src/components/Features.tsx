import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStarHalfStroke,
  FaWallet,
  FaGift,
  FaHeadset,
  FaXmark,
} from "react-icons/fa6";
import "./Extras.css";

// Textos de las ventanas: edítalos aquí para ajustar plazos, montos o contacto.
const items = [
  {
    icono: <FaStarHalfStroke />,
    titulo: "Reseñas mundiales",
    resumen: "Todos los comentarios y reseñas de jugadores",
    parrafo: "Opiniones de jugadores de todo el mundo para que decidas con información antes de aprovechar una oferta.",
    puntos: [
      "Cada reseña incluye una calificación de 1 a 5 y un comentario.",
      "El equipo de PromoHunt gestiona las reseñas para mantener un espacio respetuoso.",
      "Pronto podrás leerlas en la ficha de cada juego.",
    ],
    accion: { texto: "Ver todas las reseñas", ruta: "/resenas" },
  },
  {
    icono: <FaWallet />,
    titulo: "Reembolsos",
    resumen: "100% garantía de devolución de dinero",
    parrafo: "Si tu compra no es lo que esperabas, te devolvemos tu dinero.",
    puntos: [
      "Garantía de devolución del 100%.",
      "Solicítalo dentro de los 14 días posteriores a la compra.",
      "Escríbenos a promohunt@gmail.com con tu correo de registro y el nombre del juego.",
      "Respondemos en un máximo de 5 días hábiles.",
    ],
    accion: { texto: "Solicitar reembolso", ruta: "/reembolsos" },
  },
  {
    icono: <FaGift />,
    titulo: "Tarjeta regalo especial",
    resumen: "Ofrece bonos especiales con regalo",
    parrafo: "Regala juegos a quien quieras con una tarjeta PromoHunt.",
    puntos: [
      "Elige el valor: $10, $25, $50 o $100 USD.",
      "Se envía por correo con un código para canjear.",
      "Los bonos especiales incluyen un regalo adicional.",
      "Para pedirla, contacta a nuestro servicio al cliente.",
    ],
    accion: { texto: "Ver tarjetas de regalo", ruta: "/tarjetas-regalo" },
  },
  {
    icono: <FaHeadset />,
    titulo: "Servicio al cliente 24/7",
    resumen: "Llámenos al +57 311-3597238",
    parrafo: "Estamos para ayudarte todos los días, a cualquier hora.",
    puntos: [
      "Teléfono: +57 311-3597238",
      "Correo: promohunt@gmail.com",
      "Te ayudamos con ofertas, tu cuenta, reembolsos y tarjetas regalo.",
    ],
  },
];

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
  const accion = actual && "accion" in actual ? actual.accion : undefined;

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

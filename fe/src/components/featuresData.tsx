import type { ReactNode } from "react";
import {
  FaStarHalfStroke,
  FaWallet,
  FaGift,
  FaHeadset,
} from "react-icons/fa6";

// Textos de las ventanas: edítalos aquí para ajustar plazos, montos o contacto.
export interface Destacado {
  icono: ReactNode;
  titulo: string;
  resumen: string;
  parrafo: string;
  puntos: string[];
  accion?: { texto: string; ruta: string };
}

export const items: Destacado[] = [
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

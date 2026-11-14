import { FaStar, FaRegStar } from "react-icons/fa6";

export default function Estrellas({ valor }: { valor: number }) {
  return (
    <span aria-label={`${valor} de 5`} style={{ color: "#facc15", display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (n <= Math.round(valor) ? <FaStar key={n} /> : <FaRegStar key={n} />))}
    </span>
  );
}

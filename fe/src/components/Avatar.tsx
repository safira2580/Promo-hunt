import { useState } from "react";
import { FaUser } from "react-icons/fa6";
import "./Avatar.css";

interface Props {
  src?: string | null;
  alt?: string;
  /** Clase de tamaño/estilo del contenedor (p. ej. "perfil-foto" o "user-photo"). */
  className?: string;
}

/**
 * Foto de usuario con respaldo: si no hay foto, o la URL falla al cargar,
 * muestra un ícono de persona en lugar de la imagen rota.
 */
export default function Avatar({ src, alt = "Foto de perfil", className = "" }: Props) {
  const [srcFallida, setSrcFallida] = useState<string | null>(null);

  if (src && src !== srcFallida) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        referrerPolicy="no-referrer"
        onError={() => setSrcFallida(src)}
      />
    );
  }

  return (
    <span className={`${className} avatar-fallback`} role="img" aria-label={alt}>
      <FaUser />
    </span>
  );
}

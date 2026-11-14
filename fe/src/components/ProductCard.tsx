import {
  FaEye,
  FaHeart,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";

import { imagenJuego } from "../imagenJuego";

function ProductCard({ juego }: { juego: any }) {

  const imagen = imagenJuego(juego.nombre, juego.imagen);

  return (
    <div className="card-product">
      <div className="container-img">
        <img src={imagen} alt={juego.nombre} />
        <span className="discount">
          -{juego.porcentaje_descuento}%
        </span>
        <div className="button-group">
          <span><FaEye /></span>
          <span><FaHeart /></span>
          {juego.url_tienda ? (
            <a
              href={juego.url_tienda}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver ${juego.nombre} en ${juego.plataforma}`}
              title={`Ver en ${juego.plataforma}`}
            >
              <FaArrowUpRightFromSquare />
            </a>
          ) : (
            <span><FaArrowUpRightFromSquare /></span>
          )}
        </div>
      </div>

      <div className="content-card-product">
        <h3>{juego.nombre}</h3>
        <p className="price">
          ${juego.precio_descuento}
          <span>${juego.precio_original}</span>
        </p>
      </div>
    </div>
  );
}

export default ProductCard;

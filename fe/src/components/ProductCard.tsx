import { imagenJuego } from "../imagenJuego";
import {
  FaEye,
  FaHeart,
  FaCodeCompare,
} from "react-icons/fa6";


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
          <span><FaCodeCompare /></span>
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

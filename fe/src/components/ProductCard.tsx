import {
  FaEye,
  FaHeart,
  FaCodeCompare,
} from "react-icons/fa6";

import gta5 from "../assets/img/gta5.jpg";
import f125 from "../assets/img/f125.jpg";
import requiem from "../assets/img/requiem.jpg";
import dytb from "../assets/img/DYTB.jpg";
import mirage from "../assets/img/asc mirage.jpg";
import fc26 from "../assets/img/fc26.jpg";
import spider2 from "../assets/img/spider2.jpg";
import forza6 from "../assets/img/Forza6.jpg";
import defaultImg from "../assets/img/default.jpg";

function ProductCard({ juego }: { juego: any }) {

  const imagenes: Record<string, string> = {
    "GTA V": gta5,
    "F1 25": f125,
    "resident evil requiem": requiem,
    "Dying Light The Beast": dytb,
    "Assassins Creed Mirage": mirage,
    "EA FC 26": fc26,
    "Spiderman 2": spider2,
    "Forza Horizon 6": forza6,
  };

  const imagen = imagenes[juego.nombre] || defaultImg;

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

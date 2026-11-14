import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa6";
import { useFavoritos } from "../useFavoritos";
import "../components/Extras.css";

import { imagenJuego } from "../imagenJuego";

function Favoritos() {
  const navigate = useNavigate();
  const { items, sesion, alternar } = useFavoritos();

  return (
    <section className="container top-products pagina-favoritos">
      <h1 className="heading-1">Mis favoritos</h1>

      {sesion === false && (
        <div className="favoritos-vacio">
          <p>Inicia sesión para guardar tus juegos favoritos.</p>
          <button type="button" onClick={() => navigate("/login")}>Iniciar sesión</button>
        </div>
      )}

      {sesion && items.length === 0 && (
        <div className="favoritos-vacio">
          <p>Aún no tienes favoritos. Toca el corazón en un juego para guardarlo aquí.</p>
          <button type="button" onClick={() => navigate("/")}>Ver ofertas</button>
        </div>
      )}

      <div className="container-products">
        {items.map((juego) => (
          <div className="card-product" key={juego.id_juego}>
            <div className="container-img">
              <img src={imagenJuego(juego.nombre, juego.imagen)} alt={juego.nombre} />
              {juego.porcentaje_descuento && <span className="discount">-{juego.porcentaje_descuento}%</span>}
              <div className="button-group" style={{ opacity: 1, visibility: "visible" }}>
                <span
                  role="button"
                  tabIndex={0}
                  className="fav-activo"
                  aria-label="Quitar de favoritos"
                  onClick={() => alternar(juego.id_juego)}
                  onKeyDown={(e) => e.key === "Enter" && alternar(juego.id_juego)}
                >
                  <FaHeart />
                </span>
              </div>
            </div>
            <div className="content-card-product">
              <h3>{juego.nombre}</h3>
              {juego.precio_descuento && (
                <p className="price">
                  ${juego.precio_descuento}
                  <span>${juego.precio_original}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Favoritos;

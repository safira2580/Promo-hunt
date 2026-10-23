import {
  FaStarHalfStroke,
  FaWallet,
  FaGift,
  FaHeadset
} from "react-icons/fa6";

function Features() {
  return (
    <section className="container container-features">

      <div className="card-feature">
        <FaStarHalfStroke />

        <div className="feature-content">
          <span>Reseñas mundiales</span>
          <p>Todos los comentarios y reseñas de jugadores</p>
        </div>
      </div>

      <div className="card-feature">
        <FaWallet />

        <div className="feature-content">
          <span>Reembolsos</span>
          <p>100% garantía de devolución de dinero</p>
        </div>
      </div>

      <div className="card-feature">
        <FaGift />

        <div className="feature-content">
          <span>Tarjeta regalo especial</span>
          <p>Ofrece bonos especiales con regalo</p>
        </div>
      </div>

      <div className="card-feature">
        <FaHeadset />

        <div className="feature-content">
          <span>Servicio al cliente 24/7</span>
          <p>Llámenos al +57 311-3597238</p>
        </div>
      </div>

    </section>
  );
}

export default Features;
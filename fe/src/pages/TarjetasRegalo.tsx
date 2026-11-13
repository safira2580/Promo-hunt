import { useNavigate } from "react-router-dom";
import { FaGift, FaArrowLeft, FaCircleCheck } from "react-icons/fa6";
import "../components/Extras.css";

const CORREO = "promohunt@gmail.com";

// estado: "pedir" = se puede pedir por correo, "no-disponible" = aún no se vende,
// "adquirida" = el usuario ya la tiene.
type Estado = "pedir" | "no-disponible" | "adquirida";

const tarjetas: { valor: number; nombre: string; detalle: string; especial?: boolean; estado: Estado }[] = [
  { valor: 10, nombre: "Tarjeta Básica", detalle: "Ideal para un juego indie o un DLC.", estado: "no-disponible" },
  { valor: 25, nombre: "Tarjeta Plata", detalle: "Alcanza para un juego en oferta.", estado: "no-disponible" },
  { valor: 50, nombre: "Tarjeta Oro", detalle: "Bono especial con regalo adicional.", especial: true, estado: "adquirida" },
  { valor: 100, nombre: "Tarjeta Platino", detalle: "Bono especial con regalo adicional.", especial: true, estado: "pedir" },
];

function TarjetasRegalo() {
  const navigate = useNavigate();

  const pedir = (nombre: string, valor: number) => {
    const asunto = encodeURIComponent(`Pedido ${nombre} $${valor} USD`);
    const cuerpo = encodeURIComponent(
      `Hola, quiero pedir una ${nombre} de $${valor} USD.\nCorreo del destinatario:`,
    );
    window.location.href = `mailto:${CORREO}?subject=${asunto}&body=${cuerpo}`;
  };

  return (
    <section className="container pagina-extra">
      <button className="boton-volver" type="button" onClick={() => navigate("/")}>
        <FaArrowLeft /> Volver
      </button>
      <h1 className="heading-1">Tarjetas de regalo</h1>
      <p className="texto-ayuda">Se envían por correo con un código para canjear.</p>

      <div className="grid-tarjetas">
        {tarjetas.map((t) => (
          <div className={`tarjeta-regalo${t.especial ? " tarjeta-especial" : ""}`} key={t.valor}>
            <FaGift />
            <h3>{t.nombre}</h3>
            <p className="tarjeta-valor">${t.valor} USD</p>
            <p>{t.detalle}</p>
            {t.estado === "pedir" && (
              <button className="boton-principal" type="button" onClick={() => pedir(t.nombre, t.valor)}>
                Pedir tarjeta
              </button>
            )}
            {t.estado === "no-disponible" && (
              <button className="boton-principal boton-deshabilitado" type="button" disabled>
                No disponible aún
              </button>
            )}
            {t.estado === "adquirida" && (
              <span className="etiqueta-tiene">
                <FaCircleCheck /> Ya la tienes
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default TarjetasRegalo;

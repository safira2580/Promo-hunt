import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGift, FaArrowLeft } from "react-icons/fa6";
import { API_URL } from "../config";
import "../components/Extras.css";

const CORREO = "promohunt@gmail.com";

const tarjetas: { valor: number; nombre: string; detalle: string; especial?: boolean }[] = [
  { valor: 10, nombre: "Tarjeta Básica", detalle: "Ideal para un juego indie o un DLC." },
  { valor: 25, nombre: "Tarjeta Plata", detalle: "Alcanza para un juego en oferta." },
  { valor: 50, nombre: "Tarjeta Oro", detalle: "Bono especial con regalo adicional.", especial: true },
  { valor: 100, nombre: "Tarjeta Platino", detalle: "Bono especial con regalo adicional.", especial: true },
];

function TarjetasRegalo() {
  const navigate = useNavigate();
  // null = comprobando, true = con sesión, false = sin sesión
  const [sesion, setSesion] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/usuario/me`, { credentials: "include" })
      .then((r) => setSesion(r.ok))
      .catch(() => setSesion(false));
  }, []);

  const irALogin = () => navigate("/login", { state: { desde: "/tarjetas-regalo" } });

  const pedir = (nombre: string, valor: number) => {
    const asunto = encodeURIComponent(`Pedido ${nombre} $${valor} USD`);
    const cuerpo = encodeURIComponent(
      `Hola, quiero pedir una ${nombre} de $${valor} USD.\nCorreo del destinatario:`,
    );
    window.location.href = `mailto:${CORREO}?subject=${asunto}&body=${cuerpo}`;
  };

  const alPresionar = (nombre: string, valor: number) => {
    if (sesion === false) {
      irALogin();
    } else if (sesion === true) {
      pedir(nombre, valor);
    }
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
          <div
            className={`tarjeta-regalo${t.especial ? " tarjeta-especial" : ""}`}
            key={t.valor}
            onClick={() => sesion === false && irALogin()}
            style={sesion === false ? { cursor: "pointer" } : undefined}
          >
            <FaGift />
            <h3>{t.nombre}</h3>
            <p className="tarjeta-valor">${t.valor} USD</p>
            <p>{t.detalle}</p>
            <button
              className={`boton-principal${sesion === false ? " boton-deshabilitado" : ""}`}
              type="button"
              disabled={sesion === null}
              onClick={(e) => {
                e.stopPropagation();
                alPresionar(t.nombre, t.valor);
              }}
            >
              {sesion === false ? "Inicia sesión para pedir" : "Pedir tarjeta"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TarjetasRegalo;
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaBook, FaCircleCheck, FaCircleXmark, FaLock } from "react-icons/fa6";
import { apiFetch, mensajeDeError } from "../api";
import "../components/Extras.css";

interface Compra {
  id_compra: number;
  referencia: string;
  estado: string;
  monto: number;
  id_juego: number;
  juego: string;
  plataforma: string;
}

type Fase = "cargando" | "listo" | "procesando" | "pagada" | "rechazada" | "error";

const JSON_HEADERS = { "Content-Type": "application/json" };

function Checkout() {
  const { idDescuento } = useParams();
  const navigate = useNavigate();
  const [compra, setCompra] = useState<Compra | null>(null);
  const [fase, setFase] = useState<Fase>("cargando");
  const [mensaje, setMensaje] = useState("");
  const [yaLoTiene, setYaLoTiene] = useState(false);

  const iniciar = useCallback(async () => {
    try {
      const r = await apiFetch("/api/v1/compras", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ id_descuento: Number(idDescuento) }),
      });
      const datos = await r.json().catch(() => ({}));
      if (r.status === 401) {
        navigate("/login");
        return;
      }
      if (r.ok) {
        setCompra(datos as Compra);
        setFase("listo");
        return;
      }
      setYaLoTiene(r.status === 409);
      setMensaje(mensajeDeError(datos, "No se pudo iniciar la compra."));
      setFase("error");
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
      setFase("error");
    }
  }, [idDescuento, navigate]);

  useEffect(() => {
    iniciar();
  }, [iniciar]);

  const reintentar = () => {
    setFase("cargando");
    setMensaje("");
    iniciar();
  };

  const pagar = async (resultado: "aprobado" | "rechazado") => {
    if (!compra) return;
    setFase("procesando");
    try {
      const r = await apiFetch(`/api/v1/compras/${compra.id_compra}/pago`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ resultado }),
      });
      const datos = await r.json().catch(() => ({}));
      if (r.ok) {
        setCompra(datos as Compra);
        setFase((datos as Compra).estado === "pagada" ? "pagada" : "rechazada");
      } else {
        setMensaje(mensajeDeError(datos, "No se pudo procesar el pago."));
        setFase("error");
      }
    } catch {
      setMensaje("No se pudo conectar con el servidor.");
      setFase("error");
    }
  };

  return (
    <section className="container pagina-extra">
      <button className="boton-volver" type="button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Volver
      </button>
      <h1 className="heading-1">Finalizar compra</h1>

      {fase === "cargando" && <p className="estado-vacio">Preparando tu compra...</p>}

      {fase === "error" && (
        <div className="estado-vacio">
          <p className="msg-error">{mensaje}</p>
          {yaLoTiene ? (
            <button className="boton-principal" type="button" onClick={() => navigate("/biblioteca")}>
              Ver mi biblioteca
            </button>
          ) : (
            <button className="boton-principal" type="button" onClick={reintentar}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {compra && (fase === "listo" || fase === "procesando") && (
        <div className="checkout-caja">
          <p className="aviso-demo">
            <FaLock /> Modo demostración: el pago es simulado y no se cobra dinero real.
          </p>
          <div className="checkout-fila">
            <span>Juego</span>
            <strong>{compra.juego}</strong>
          </div>
          <div className="checkout-fila">
            <span>Tienda</span>
            <strong>{compra.plataforma || "—"}</strong>
          </div>
          <div className="checkout-fila">
            <span>Referencia</span>
            <strong>{compra.referencia}</strong>
          </div>
          <div className="checkout-fila checkout-total">
            <span>Total a pagar</span>
            <strong>COL${compra.monto.toLocaleString("es-CO")}</strong>
          </div>
          <div className="checkout-acciones">
            <button
              className="boton-principal"
              type="button"
              disabled={fase === "procesando"}
              onClick={() => pagar("aprobado")}
            >
              {fase === "procesando" ? "Procesando..." : "Pagar (simulado)"}
            </button>
            <button
              className="boton-secundario"
              type="button"
              disabled={fase === "procesando"}
              onClick={() => pagar("rechazado")}
            >
              Simular pago rechazado
            </button>
          </div>
        </div>
      )}

      {fase === "pagada" && compra && (
        <div className="estado-vacio">
          <FaCircleCheck className="checkout-icono ok" />
          <h2>¡Pago aprobado!</h2>
          <p className="msg-ok">{compra.juego} ya está en tu biblioteca.</p>
          <button className="boton-principal" type="button" onClick={() => navigate("/biblioteca")}>
            <FaBook /> Ir a mi biblioteca
          </button>
        </div>
      )}

      {fase === "rechazada" && (
        <div className="estado-vacio">
          <FaCircleXmark className="checkout-icono mal" />
          <h2>Pago rechazado</h2>
          <p className="msg-error">No se realizó ningún cobro. Puedes intentarlo de nuevo.</p>
          <button className="boton-principal" type="button" onClick={reintentar}>
            Intentar de nuevo
          </button>
        </div>
      )}
    </section>
  );
}

export default Checkout;

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaWallet } from "react-icons/fa6";
import { API_URL } from "../config";
import { authFetch, getToken, mensajeDeError } from "../api";
import { imagenJuego } from "../imagenJuego";
import "../components/Extras.css";

interface JuegoLista {
  id_juego: number;
  nombre: string;
  imagen: string | null;
}

interface Reembolso {
  id_reembolso: number;
  juego: string;
  motivo: string;
  estado: string;
  fecha_solicitud: string;
}

function Reembolsos() {
  const navigate = useNavigate();
  const [sesion, setSesion] = useState<boolean | null>(null);
  const [lista, setLista] = useState<Reembolso[]>([]);
  const [juegos, setJuegos] = useState<JuegoLista[]>([]);
  const [juego, setJuego] = useState("");
  const [abierta, setAbierta] = useState(false);
  const [errorLista, setErrorLista] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const cargar = async () => {
    try {
      if (!getToken()) {
        setSesion(false);
        return;
      }
      const r = await authFetch(`${API_URL}/api/v1/reembolsos`);
      if (r.status === 401) {
        setSesion(false);
        return;
      }
      setSesion(true);
      setLista(r.ok ? await r.json() : []);
    } catch {
      setSesion(false);
    }
  };

  useEffect(() => {
    cargar();
    fetch(`${API_URL}/api/v1/juegos-lista`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setJuegos)
      .catch(() => setErrorLista(true));
  }, []);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!juegos.some((j) => j.nombre === juego)) {
      setMensaje({ ok: false, texto: "Elige un juego de la lista." });
      return;
    }
    setEnviando(true);
    setMensaje(null);
    try {
      const r = await authFetch(`${API_URL}/api/v1/reembolsos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juego, motivo }),
      });
      const datos = await r.json().catch(() => ({}));
      if (r.ok) {
        setMensaje({ ok: true, texto: "Solicitud enviada. Te respondemos en máximo 5 días hábiles." });
        setJuego("");
        setMotivo("");
        cargar();
      } else {
        setMensaje({ ok: false, texto: mensajeDeError(datos, "No se pudo enviar la solicitud.") });
      }
    } catch {
      setMensaje({ ok: false, texto: "No se pudo conectar con el servidor." });
    }
    setEnviando(false);
  };

  return (
    <section className="container reembolso-pagina">
      <div className="reembolso-cabecera">
        <button className="boton-volver" type="button" onClick={() => navigate("/")}>
          <FaArrowLeft /> Volver
        </button>
        <span className="reembolso-icono">
          <FaWallet />
        </span>
        <h1 className="heading-1">Solicitar reembolso</h1>
        <p className="texto-ayuda">Garantía de devolución del 100% dentro de los 14 días posteriores a la compra.</p>
      </div>

      <div className="reembolso-grid" style={{ gridTemplateColumns: "minmax(0, 52rem)", justifyContent: "center" }}>
        <div className="reembolso-centro">
          {sesion === false && (
            <div className="estado-vacio">
              <p>Inicia sesión para solicitar un reembolso.</p>
              <button className="boton-principal" type="button" onClick={() => navigate("/login")}>
                Iniciar sesión
              </button>
            </div>
          )}

          {sesion && (
            <form className="form-extra" onSubmit={enviar}>
              <label>
                Juego a reembolsar
                <div className="combo-juegos">
                  <input
                    value={juego}
                    onChange={(e) => {
                      setJuego(e.target.value);
                      setAbierta(true);
                    }}
                    onFocus={() => setAbierta(true)}
                    onBlur={() => setTimeout(() => setAbierta(false), 150)}
                    placeholder="Haz clic para ver todos los juegos"
                    maxLength={150}
                    autoComplete="off"
                    required
                  />
                  {abierta && (
                    <ul className="combo-lista">
                      {(juegos.some((j) => j.nombre === juego)
                        ? juegos
                        : juegos.filter((j) => j.nombre.toLowerCase().includes(juego.trim().toLowerCase()))
                      ).map((j) => (
                        <li
                          key={j.id_juego}
                          onMouseDown={() => {
                            setJuego(j.nombre);
                            setAbierta(false);
                          }}
                        >
                          <img src={imagenJuego(j.nombre, j.imagen)} alt="" />
                          {j.nombre}
                        </li>
                      ))}
                      {juegos.length === 0 && !errorLista && <li className="combo-vacio">Cargando juegos...</li>}
                      {errorLista && <li className="combo-vacio">No se pudo cargar la lista. Reinicia el backend.</li>}
                    </ul>
                  )}
                </div>
              </label>
              <label>
                Motivo
                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={4} maxLength={1000} required />
              </label>
              <button className="boton-principal" type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Solicitar reembolso"}
              </button>
              {mensaje && <p className={mensaje.ok ? "msg-ok" : "msg-error"}>{mensaje.texto}</p>}
            </form>
          )}
        </div>
      </div>

      {sesion && lista.length > 0 && (
        <div className="reembolso-solicitudes">
          <h2 className="subtitulo-extra">Mis solicitudes</h2>
          <div className="lista-resenas">
            {lista.map((x) => (
              <article className="resena-card" key={x.id_reembolso}>
                <header>
                  <h3>{x.juego}</h3>
                  <span className="etiqueta-estado">{x.estado}</span>
                </header>
                <p>{x.motivo}</p>
                <footer>{new Date(x.fecha_solicitud).toLocaleDateString("es-CO")}</footer>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default Reembolsos;
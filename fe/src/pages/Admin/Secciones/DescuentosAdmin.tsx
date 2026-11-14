import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../../config";
import { authFetch, mensajeDeError } from "../../../api";
import "./DescuentosAdmin.css";

interface Descuento {
  id_descuento?: number;
  id_juego: number | string;
  id_plataforma: number | string;
  juego?: string;
  plataforma?: string;
  precio_original: number | string;
  precio_descuento: number | string;
  porcentaje_descuento?: number | string | null;
  ahorro?: number | string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  estado: string;
}

interface JuegoOpcion {
  id_juego: number;
  nombre: string;
}

const BASE = `${API_URL}/api/v1/admin/descuentos`;

const dinero = (v: number | string | null | undefined) =>
  v === null || v === undefined || v === "" ? "—" : `$${Number(v).toFixed(2)}`;

const soloFecha = (v?: string | null) => (v ? v.slice(0, 10) : "");

const hoyLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** La fecha de fin es el último día de vigencia: vencida si ya pasó ese día. */
const vencida = (fin?: string | null) => !!fin && fin < hoyLocal();

const formularioVacio = (): Descuento => ({
  id_juego: "",
  id_plataforma: "",
  precio_original: "",
  precio_descuento: "",
  fecha_inicio: "",
  fecha_fin: "",
  estado: "Activo",
});

/**
 * Porcentaje con el precio original como 100 %:
 *   porcentaje = (original − con descuento) / original × 100
 * Devuelve null si los precios todavía no permiten calcularlo.
 */
function calcular(original: number | string, conDescuento: number | string) {
  if (original === "" || conDescuento === "") return null;

  const po = Number(original);
  const pd = Number(conDescuento);

  if (!Number.isFinite(po) || !Number.isFinite(pd)) return null;

  const ahorro = po - pd;
  const porcentaje = po > 0 ? (ahorro / po) * 100 : 0;

  return {
    ahorro: Math.round(ahorro * 100) / 100,
    porcentaje: Math.round(porcentaje * 100) / 100,
    valido: po > 0 && pd >= 0 && pd < po,
  };
}

function DescuentosAdmin() {

  const [descuentos, setDescuentos] = useState<Descuento[]>([]);
  const [juegos, setJuegos] = useState<JuegoOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Descuento | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [errorForm, setErrorForm] = useState("");


  // ============================
  // OBTENER DESCUENTOS Y JUEGOS
  // ============================

  const obtenerDescuentos = async () => {

    try {

      setCargando(true);

      const respuesta = await authFetch(BASE);
      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setAviso({ ok: false, texto: mensajeDeError(datos, "Error obteniendo descuentos") });
        return;
      }

      setDescuentos(datos.descuentos || []);

    } catch (error) {

      console.error("Error obteniendo descuentos:", error);
      setAviso({ ok: false, texto: "No se pudo conectar con el servidor" });

    } finally {

      setCargando(false);

    }

  };

  const obtenerJuegos = async () => {

    try {

      const respuesta = await authFetch(`${API_URL}/api/v1/admin/juegos`);
      if (!respuesta.ok) return;

      const datos = await respuesta.json().catch(() => ({}));
      const lista = datos.juegos || [];

      setJuegos(
        lista.map((j: JuegoOpcion) => ({ id_juego: j.id_juego, nombre: j.nombre }))
      );

    } catch {
      // Sin lista de juegos se usa el campo numérico
    }

  };

  useEffect(() => {
    obtenerDescuentos();
    obtenerJuegos();
  }, []);


  // ============================
  // VISTA PREVIA EN VIVO
  // ============================

  const calculo = useMemo(
    () => (editando ? calcular(editando.precio_original, editando.precio_descuento) : null),
    [editando]
  );


  // ============================
  // NUEVO / EDITAR
  // ============================

  const nuevo = () => {
    setErrorForm("");
    setEditando(formularioVacio());
  };

  const editar = (d: Descuento) => {
    setErrorForm("");
    setEditando({
      ...d,
      precio_original: String(d.precio_original ?? ""),
      precio_descuento: String(d.precio_descuento ?? ""),
      fecha_inicio: soloFecha(d.fecha_inicio),
      fecha_fin: soloFecha(d.fecha_fin),
    });
  };

  const cambiar = (campo: keyof Descuento, valor: string) => {
    if (!editando) return;
    setEditando({ ...editando, [campo]: valor });
  };


  // ============================
  // GUARDAR
  // El porcentaje y el ahorro no se envían: el backend los calcula
  // a partir del precio original y el precio con descuento.
  // ============================

  const guardar = async () => {

    if (!editando) return;

    if (!editando.id_juego || !editando.id_plataforma) {
      setErrorForm("Elige el juego e indica la plataforma");
      return;
    }

    if (!calculo) {
      setErrorForm("Ingresa el precio original y el precio con descuento");
      return;
    }

    if (!calculo.valido) {
      setErrorForm("El precio con descuento debe ser menor al precio original");
      return;
    }

    if (
      editando.fecha_inicio &&
      editando.fecha_fin &&
      editando.fecha_fin < editando.fecha_inicio
    ) {
      setErrorForm("La fecha de fin no puede ser anterior a la de inicio");
      return;
    }

    setErrorForm("");
    setGuardando(true);

    const esEdicion = !!editando.id_descuento;

    try {

      const respuesta = await authFetch(
        esEdicion ? `${BASE}/${editando.id_descuento}` : BASE,
        {
          method: esEdicion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_juego: Number(editando.id_juego),
            id_plataforma: Number(editando.id_plataforma),
            precio_original: Number(editando.precio_original),
            precio_descuento: Number(editando.precio_descuento),
            fecha_inicio: editando.fecha_inicio || null,
            fecha_fin: editando.fecha_fin || null,
            estado: vencida(editando.fecha_fin) ? "Inactivo" : editando.estado,
          }),
        }
      );

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setErrorForm(mensajeDeError(datos, "Error guardando el descuento"));
        setGuardando(false);
        return;
      }

      setAviso({
        ok: true,
        texto: esEdicion
          ? "Descuento actualizado correctamente ✅"
          : "Descuento agregado correctamente ✅",
      });

      setEditando(null);
      obtenerDescuentos();

    } catch (error) {

      console.error("Error guardando descuento:", error);
      setErrorForm("Error conectando con el servidor");

    }

    setGuardando(false);

  };


  // ============================
  // ELIMINAR
  // ============================

  const eliminar = async (id: number) => {

    if (!window.confirm("¿Seguro que quieres eliminar este descuento?")) {
      return;
    }

    try {

      const respuesta = await authFetch(`${BASE}/${id}`, { method: "DELETE" });
      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        setAviso({ ok: false, texto: mensajeDeError(datos, "No se pudo eliminar el descuento") });
        return;
      }

      setAviso({ ok: true, texto: "Descuento eliminado correctamente ✅" });
      obtenerDescuentos();

    } catch (error) {

      console.error("Error eliminando descuento:", error);
      setAviso({ ok: false, texto: "Error conectando con el servidor" });

    }

  };


  // ============================
  // CARGANDO
  // ============================

  if (cargando) {

    return (
      <div className="admin-empty">
        <p>Cargando descuentos...</p>
      </div>
    );

  }


  // ============================
  // INTERFAZ
  // ============================

  return (

    <>

      {/* ENCABEZADO */}

      <div className="admin-section-header">

        <div>
          <span className="admin-label">GESTIÓN</span>
          <h2>💰 Descuentos</h2>
          <p>Administra los descuentos de PromoHunt</p>
        </div>

        <button className="admin-add-button" onClick={nuevo}>
          + Agregar descuento
        </button>

      </div>


      {aviso && (
        <p className={`desc-aviso ${aviso.ok ? "ok" : "error"}`}>
          {aviso.texto}
        </p>
      )}


      {/* TABLA */}

      {descuentos.length === 0 ? (

        <div className="admin-empty">
          <p>No hay descuentos registrados.</p>
        </div>

      ) : (

        <div className="admin-tabla-container">

          <table className="admin-tabla">

            <thead>
              <tr>
                <th>Juego</th>
                <th>Plataforma</th>
                <th>Precio original</th>
                <th>Con descuento</th>
                <th>Descuento</th>
                <th>Ahorro</th>
                <th>Vigencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {descuentos.map((d) => (

                <tr key={d.id_descuento}>

                  <td>{d.juego ?? d.id_juego}</td>
                  <td>{d.plataforma ?? d.id_plataforma}</td>
                  <td>{dinero(d.precio_original)}</td>
                  <td>{dinero(d.precio_descuento)}</td>

                  <td>
                    <span className="desc-insignia">
                      {Number(d.porcentaje_descuento ?? 0)}%
                    </span>
                  </td>

                  <td>{dinero(d.ahorro)}</td>

                  <td>
                    {soloFecha(d.fecha_inicio) || "—"} → {soloFecha(d.fecha_fin) || "—"}
                  </td>

                  <td>
                    <span
                      className={
                        d.estado === "Activo" ? "estado-activo" : "estado-inactivo"
                      }
                    >
                      {d.estado}
                    </span>
                  </td>

                  <td>

                    <button
                      className="admin-editar"
                      onClick={() => editar(d)}
                      title="Editar descuento"
                    >
                      ✏️
                    </button>

                    <button
                      className="admin-eliminar"
                      onClick={() => eliminar(d.id_descuento as number)}
                      title="Eliminar descuento"
                    >
                      🗑️
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}


      {/* MODAL AGREGAR / EDITAR */}

      {editando && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>
                <span className="admin-label">GESTIÓN</span>
                <h2>
                  {editando.id_descuento ? "Editar descuento" : "Agregar descuento"}
                </h2>
              </div>

              <button
                className="admin-modal-cerrar"
                onClick={() => setEditando(null)}
              >
                ✕
              </button>

            </div>


            <div className="desc-form">

              {/* JUEGO */}

              <div className="desc-campo">

                <label>Juego</label>

                {juegos.length > 0 ? (

                  <select
                    value={editando.id_juego}
                    onChange={(e) => cambiar("id_juego", e.target.value)}
                  >
                    <option value="">Selecciona un juego</option>
                    {juegos.map((j) => (
                      <option key={j.id_juego} value={j.id_juego}>
                        {j.nombre}
                      </option>
                    ))}
                  </select>

                ) : (

                  <input
                    type="number"
                    value={editando.id_juego}
                    onChange={(e) => cambiar("id_juego", e.target.value)}
                    placeholder="ID del juego"
                  />

                )}

              </div>


              {/* PLATAFORMA */}

              <div className="desc-campo">

                <label>Plataforma</label>

                <input
                  type="number"
                  value={editando.id_plataforma}
                  onChange={(e) => cambiar("id_plataforma", e.target.value)}
                  placeholder="ID de la plataforma"
                />

              </div>


              {/* PRECIOS */}

              <div className="desc-campo">

                <label>Precio original (100 %)</label>

                <div className="desc-precio">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editando.precio_original}
                    onChange={(e) => cambiar("precio_original", e.target.value)}
                    placeholder="60.00"
                  />
                </div>

              </div>


              <div className="desc-campo">

                <label>Precio con descuento</label>

                <div className="desc-precio">
                  <span>$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editando.precio_descuento}
                    onChange={(e) => cambiar("precio_descuento", e.target.value)}
                    placeholder="45.00"
                  />
                </div>

              </div>


              {/* VISTA PREVIA: PORCENTAJE AUTOMÁTICO */}

              <div className={`desc-resumen${calculo && !calculo.valido ? " invalido" : ""}`}>

                {calculo ? (

                  <>
                    <div className="desc-resumen-cifras">

                      <span className="desc-porcentaje">
                        {calculo.valido ? `${calculo.porcentaje}%` : "—"}
                      </span>

                      <span className="desc-ahorro">
                        {calculo.valido ? (
                          <>
                            El cliente ahorra <strong>{dinero(calculo.ahorro)}</strong>
                          </>
                        ) : (
                          "El precio con descuento debe ser menor al original"
                        )}
                      </span>

                    </div>

                    <div className="desc-barra">
                      <div
                        style={{
                          width: `${calculo.valido ? Math.min(calculo.porcentaje, 100) : 0}%`,
                        }}
                      />
                    </div>
                  </>

                ) : (

                  <span className="desc-ahorro">
                    Ingresa los dos precios y el porcentaje se calcula solo.
                  </span>

                )}

                <p className="desc-nota">
                  Porcentaje = (original − descuento) ÷ original × 100. Se calcula
                  automáticamente al guardar.
                </p>

              </div>


              {/* FECHAS */}

              <div className="desc-campo">

                <label>Fecha de inicio</label>

                <input
                  type="date"
                  value={editando.fecha_inicio ?? ""}
                  onChange={(e) => cambiar("fecha_inicio", e.target.value)}
                />

              </div>


              <div className="desc-campo">

                <label>Fecha de finalización</label>

                <input
                  type="date"
                  value={editando.fecha_fin ?? ""}
                  onChange={(e) => cambiar("fecha_fin", e.target.value)}
                />

                <small>
                  {vencida(editando.fecha_fin)
                    ? "Esta fecha ya pasó: el descuento se guardará como Inactivo."
                    : "Al terminar este día, el descuento pasa solo a Inactivo."}
                </small>

              </div>


              {/* ESTADO */}

              <div className="desc-campo ancho">

                <label>Estado</label>

                <select
                  value={editando.estado}
                  onChange={(e) => cambiar("estado", e.target.value)}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>

              </div>

            </div>


            {errorForm && (
              <p className="desc-aviso error" style={{ marginTop: 14 }}>
                {errorForm}
              </p>
            )}


            <div className="admin-modal-footer">

              <button
                className="admin-modal-cancelar"
                onClick={() => setEditando(null)}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                className="admin-add-button"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : editando.id_descuento
                    ? "Guardar cambios"
                    : "Agregar descuento"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

}

export default DescuentosAdmin;

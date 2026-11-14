import { useEffect, useState } from "react";
import { adminPeticion, aNumero, fechaCorta } from "../adminApi";
import "../AdminFormulario.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fila = Record<string, any>;

const vacia = (): Fila => ({
  id_usuario: "",
  id_juego: "",
  titulo: "",
  comentario: "",
  calificacion: 5,
});

const estrellas = (n: unknown) => "⭐".repeat(Number(n) || 0) || "—";

function ResenasAdmin() {

  const [resenas, setResenas] = useState<Fila[]>([]);
  const [juegos, setJuegos] = useState<Fila[]>([]);
  const [seleccionada, setSeleccionada] = useState<Fila | null>(null);
  const [editando, setEditando] = useState<Fila | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [errorForm, setErrorForm] = useState("");


  // =========================
  // OBTENER RESEÑAS Y JUEGOS
  // =========================

  const cargar = async () => {

    setCargando(true);

    const r = await adminPeticion("/resenas", {}, "Error obteniendo reseñas");

    if (r.ok) setResenas(r.datos.resenas || []);
    else setAviso({ ok: false, texto: r.error });

    setCargando(false);

  };

  const cargarJuegos = async () => {
    const r = await adminPeticion("/juegos");
    if (r.ok) setJuegos(r.datos.juegos || []);
  };

  useEffect(() => {
    cargar();
    cargarJuegos();
  }, []);


  // =========================
  // FORMULARIO
  // =========================

  const cambiar = (campo: string, valor: string | number) =>
    setEditando((previo) => (previo ? { ...previo, [campo]: valor } : previo));


  // =========================
  // GUARDAR
  // =========================

  const guardar = async () => {

    if (!editando) return;

    if (!editando.id_usuario || !editando.id_juego) {
      setErrorForm("Indica el usuario y el juego de la reseña");
      return;
    }

    if (!String(editando.titulo ?? "").trim()) {
      setErrorForm("Escribe el título de la reseña");
      return;
    }

    if (!String(editando.comentario ?? "").trim()) {
      setErrorForm("Escribe el comentario");
      return;
    }

    const calificacion = Number(editando.calificacion);

    if (!(calificacion >= 1 && calificacion <= 5)) {
      setErrorForm("La calificación debe estar entre 1 y 5");
      return;
    }

    setErrorForm("");
    setGuardando(true);

    const esEdicion = !!editando.id_resena;

    const cuerpo = {
      id_usuario: aNumero(editando.id_usuario),
      id_juego: aNumero(editando.id_juego),
      titulo: String(editando.titulo).trim(),
      comentario: String(editando.comentario).trim(),
      calificacion,
    };

    const r = await adminPeticion(
      esEdicion ? `/resenas/${editando.id_resena}` : "/resenas",
      { method: esEdicion ? "PUT" : "POST", body: JSON.stringify(cuerpo) },
      "Error guardando la reseña"
    );

    setGuardando(false);

    if (!r.ok) {
      setErrorForm(r.error);
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Reseña guardada"} ✅` });
    setEditando(null);
    cargar();

  };


  // =========================
  // ELIMINAR
  // =========================

  const eliminar = async (id: number) => {

    if (!window.confirm("¿Seguro que quieres eliminar esta reseña?")) return;

    const r = await adminPeticion(`/resenas/${id}`, { method: "DELETE" }, "No se pudo eliminar la reseña");

    if (!r.ok) {
      setAviso({ ok: false, texto: r.error });
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Reseña eliminada"} ✅` });
    cargar();

  };


  return (

    <>

      {/* ENCABEZADO */}

      <div className="admin-section-header">

        <div>
          <h2>⭐ Reseñas</h2>
          <p>Administra las reseñas de los usuarios de PromoHunt.</p>
        </div>

        <button
          className="admin-add-button"
          onClick={() => {
            setErrorForm("");
            setEditando(vacia());
          }}
        >
          + Agregar reseña
        </button>

      </div>


      {aviso && (
        <p className={`adm-aviso ${aviso.ok ? "ok" : "error"}`}>{aviso.texto}</p>
      )}


      {/* TABLA */}

      {cargando ? (

        <div className="admin-empty">Cargando reseñas...</div>

      ) : resenas.length === 0 ? (

        <div className="admin-empty">No hay reseñas registradas.</div>

      ) : (

        <div className="admin-tabla">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Juego</th>
                <th>Título</th>
                <th>Calificación</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {resenas.map((resena) => (

                <tr key={resena.id_resena}>

                  <td>{resena.id_resena}</td>
                  <td><strong>{resena.usuario || "—"}</strong></td>
                  <td>{resena.juego || "—"}</td>
                  <td className="adm-celda-corta">{resena.titulo || "—"}</td>
                  <td>{estrellas(resena.calificacion)}</td>
                  <td>{fechaCorta(resena.fecha_publicacion)}</td>

                  <td>

                    <button className="admin-ver" onClick={() => setSeleccionada(resena)} title="Ver detalles">
                      👁️
                    </button>

                    <button
                      className="admin-editar"
                      onClick={() => {
                        setErrorForm("");
                        setEditando({ ...resena });
                      }}
                      title="Editar reseña"
                    >
                      ✏️
                    </button>

                    <button
                      className="admin-eliminar"
                      onClick={() => eliminar(resena.id_resena)}
                      title="Eliminar reseña"
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
                <span>{editando.id_resena ? "EDITAR RESEÑA" : "NUEVA RESEÑA"}</span>
                <h2>{editando.id_resena ? "✏️ Editar reseña" : "⭐ Agregar reseña"}</h2>
              </div>

              <button className="admin-modal-cerrar" onClick={() => setEditando(null)}>
                ✕
              </button>

            </div>


            <div className="adm-modal-cuerpo">

              <div className="adm-form">

                <div className="adm-campo">
                  <label>ID del usuario *</label>
                  <input
                    type="number"
                    min="1"
                    value={editando.id_usuario ?? ""}
                    onChange={(e) => cambiar("id_usuario", e.target.value)}
                    placeholder="Ej: 15"
                  />
                  {editando.usuario && <small>Usuario actual: {editando.usuario}</small>}
                </div>

                <div className="adm-campo">
                  <label>Juego *</label>

                  {juegos.length > 0 ? (

                    <select
                      value={editando.id_juego ?? ""}
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
                      min="1"
                      value={editando.id_juego ?? ""}
                      onChange={(e) => cambiar("id_juego", e.target.value)}
                      placeholder="ID del juego"
                    />

                  )}

                </div>

                <div className="adm-campo ancho">
                  <label>Título *</label>
                  <input
                    value={editando.titulo ?? ""}
                    onChange={(e) => cambiar("titulo", e.target.value)}
                    maxLength={150}
                    placeholder="Título de la reseña"
                  />
                </div>

                <div className="adm-campo ancho">
                  <label>Comentario *</label>
                  <textarea
                    value={editando.comentario ?? ""}
                    onChange={(e) => cambiar("comentario", e.target.value)}
                    placeholder="Opinión sobre el juego"
                  />
                </div>

                <div className="adm-campo ancho">
                  <label>Calificación *</label>
                  <div className="adm-estrellas">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        className={n <= Number(editando.calificacion) ? "activa" : ""}
                        onClick={() => cambiar("calificacion", n)}
                        title={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>


            {errorForm && (
              <p className="adm-aviso error" style={{ marginTop: 14 }}>{errorForm}</p>
            )}


            <div className="admin-modal-footer">

              <button
                className="admin-modal-cancelar"
                onClick={() => setEditando(null)}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button className="admin-add-button" onClick={guardar} disabled={guardando}>
                {guardando ? "Guardando..." : "💾 Guardar"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* MODAL VER */}

      {seleccionada && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>
                <span>DETALLES DE LA RESEÑA</span>
                <h2>{seleccionada.titulo}</h2>
              </div>

              <button className="admin-modal-cerrar" onClick={() => setSeleccionada(null)}>
                ✕
              </button>

            </div>


            <div className="admin-detalles-grid">

              <div className="admin-detalle">
                <span>Usuario</span>
                <strong>{seleccionada.usuario || "—"}</strong>
              </div>

              <div className="admin-detalle">
                <span>Juego</span>
                <strong>{seleccionada.juego || "—"}</strong>
              </div>

              <div className="admin-detalle">
                <span>Calificación</span>
                <strong>{estrellas(seleccionada.calificacion)}</strong>
              </div>

              <div className="admin-detalle">
                <span>ID usuario</span>
                <strong>{seleccionada.id_usuario}</strong>
              </div>

              <div className="admin-detalle">
                <span>ID juego</span>
                <strong>{seleccionada.id_juego}</strong>
              </div>

              <div className="admin-detalle">
                <span>Fecha</span>
                <strong>{fechaCorta(seleccionada.fecha_publicacion)}</strong>
              </div>

            </div>


            <div className="admin-detalle-grande">
              <span>Comentario</span>
              <p>{seleccionada.comentario || "Sin comentario"}</p>
            </div>

          </div>

        </div>

      )}

    </>

  );

}

export default ResenasAdmin;

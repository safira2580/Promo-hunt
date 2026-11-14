import { useEffect, useState } from "react";
import { adminPeticion, soloFecha, fechaCorta } from "../adminApi";
import "../AdminFormulario.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fila = Record<string, any>;

const vacio = (): Fila => ({
  nombre: "",
  pais: "",
  ciudad: "",
  fundacion: "",
  sitio_web: "",
  logo: "",
  descripcion: "",
});

function DesarrolladoresAdmin() {

  const [desarrolladores, setDesarrolladores] = useState<Fila[]>([]);
  const [editando, setEditando] = useState<Fila | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [errorForm, setErrorForm] = useState("");


  // =========================
  // OBTENER DESARROLLADORES
  // =========================

  const cargar = async () => {

    setCargando(true);

    const r = await adminPeticion("/desarrolladores", {}, "Error obteniendo desarrolladores");

    if (r.ok) setDesarrolladores(r.datos.desarrolladores || []);
    else setAviso({ ok: false, texto: r.error });

    setCargando(false);

  };

  useEffect(() => {
    cargar();
  }, []);


  // =========================
  // NUEVO / EDITAR
  // =========================

  const nuevo = () => {
    setErrorForm("");
    setEditando(vacio());
  };

  const editar = (d: Fila) => {
    setErrorForm("");
    setEditando({ ...vacio(), ...d, fundacion: soloFecha(d.fundacion) });
  };

  const cambiar = (campo: string, valor: string) =>
    setEditando((previo) => (previo ? { ...previo, [campo]: valor } : previo));


  // =========================
  // GUARDAR
  // =========================

  const guardar = async () => {

    if (!editando) return;

    if (!String(editando.nombre ?? "").trim()) {
      setErrorForm("Escribe el nombre del desarrollador");
      return;
    }

    setErrorForm("");
    setGuardando(true);

    const esEdicion = !!editando.id_desarrollador;

    const cuerpo = {
      nombre: String(editando.nombre).trim(),
      pais: editando.pais,
      ciudad: editando.ciudad,
      fundacion: soloFecha(editando.fundacion) || null,
      sitio_web: editando.sitio_web,
      logo: editando.logo,
      descripcion: editando.descripcion,
    };

    const r = await adminPeticion(
      esEdicion ? `/desarrolladores/${editando.id_desarrollador}` : "/desarrolladores",
      { method: esEdicion ? "PUT" : "POST", body: JSON.stringify(cuerpo) },
      "Error guardando el desarrollador"
    );

    setGuardando(false);

    if (!r.ok) {
      setErrorForm(r.error);
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Desarrollador guardado"} ✅` });
    setEditando(null);
    cargar();

  };


  // =========================
  // ELIMINAR
  // =========================

  const eliminar = async (id: number) => {

    if (!window.confirm("¿Seguro que quieres eliminar este desarrollador?")) return;

    const r = await adminPeticion(
      `/desarrolladores/${id}`,
      { method: "DELETE" },
      "No se pudo eliminar el desarrollador"
    );

    if (!r.ok) {
      // Si hay juegos asociados, el backend responde 409 con el motivo
      setAviso({ ok: false, texto: r.error });
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Desarrollador eliminado"} ✅` });
    cargar();

  };


  return (

    <>

      {/* ENCABEZADO */}

      <div className="admin-section-header">

        <div>
          <h2>👨‍💻 Desarrolladores</h2>
          <p>Administra los desarrolladores de PromoHunt</p>
        </div>

        <button className="admin-add-button" onClick={nuevo}>
          + Agregar desarrollador
        </button>

      </div>


      {aviso && (
        <p className={`adm-aviso ${aviso.ok ? "ok" : "error"}`}>{aviso.texto}</p>
      )}


      {/* TABLA */}

      {cargando ? (

        <div className="admin-empty">Cargando desarrolladores...</div>

      ) : desarrolladores.length === 0 ? (

        <div className="admin-empty">No hay desarrolladores registrados.</div>

      ) : (

        <div className="admin-tabla">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>País</th>
                <th>Ciudad</th>
                <th>Fundación</th>
                <th>Sitio web</th>
                <th>Logo</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {desarrolladores.map((d) => (

                <tr key={d.id_desarrollador}>

                  <td>{d.id_desarrollador}</td>
                  <td><strong>{d.nombre}</strong></td>
                  <td>{d.pais || "—"}</td>
                  <td>{d.ciudad || "—"}</td>
                  <td>{fechaCorta(d.fundacion)}</td>
                  <td className="adm-celda-corta">{d.sitio_web || "—"}</td>
                  <td className="adm-celda-corta">{d.logo || "—"}</td>
                  <td className="adm-celda-corta">{d.descripcion || "—"}</td>

                  <td>

                    <button className="admin-editar" onClick={() => editar(d)} title="Editar desarrollador">
                      ✏️
                    </button>

                    <button
                      className="admin-eliminar"
                      onClick={() => eliminar(d.id_desarrollador)}
                      title="Eliminar desarrollador"
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
                <span>GESTIÓN</span>
                <h2>
                  {editando.id_desarrollador ? "✏️ Editar desarrollador" : "👨‍💻 Agregar desarrollador"}
                </h2>
              </div>

              <button className="admin-modal-cerrar" onClick={() => setEditando(null)}>
                ✕
              </button>

            </div>


            <div className="adm-modal-cuerpo">

              <div className="adm-form">

                <div className="adm-campo ancho">
                  <label>Nombre *</label>
                  <input
                    value={editando.nombre ?? ""}
                    onChange={(e) => cambiar("nombre", e.target.value)}
                    maxLength={150}
                    placeholder="Nombre del desarrollador"
                  />
                </div>

                <div className="adm-campo">
                  <label>País</label>
                  <input
                    value={editando.pais ?? ""}
                    onChange={(e) => cambiar("pais", e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="adm-campo">
                  <label>Ciudad</label>
                  <input
                    value={editando.ciudad ?? ""}
                    onChange={(e) => cambiar("ciudad", e.target.value)}
                    maxLength={100}
                  />
                </div>

                <div className="adm-campo">
                  <label>Fecha de fundación</label>
                  <input
                    type="date"
                    value={editando.fundacion ?? ""}
                    onChange={(e) => cambiar("fundacion", e.target.value)}
                  />
                </div>

                <div className="adm-campo">
                  <label>Sitio web</label>
                  <input
                    value={editando.sitio_web ?? ""}
                    onChange={(e) => cambiar("sitio_web", e.target.value)}
                    maxLength={255}
                    placeholder="https://..."
                  />
                </div>

                <div className="adm-campo ancho">
                  <label>Logo</label>
                  <input
                    value={editando.logo ?? ""}
                    onChange={(e) => cambiar("logo", e.target.value)}
                    maxLength={255}
                    placeholder="Archivo o URL"
                  />
                </div>

                <div className="adm-campo ancho">
                  <label>Descripción</label>
                  <textarea
                    value={editando.descripcion ?? ""}
                    onChange={(e) => cambiar("descripcion", e.target.value)}
                  />
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
                {guardando
                  ? "Guardando..."
                  : editando.id_desarrollador
                    ? "💾 Guardar cambios"
                    : "💾 Agregar desarrollador"}
              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

}

export default DesarrolladoresAdmin;

import { useEffect, useState } from "react";
import { adminPeticion, fechaCorta } from "../adminApi";
import "../AdminFormulario.css";

/**
 * Pantalla genérica para los catálogos con la forma { nombre, descripcion }.
 * La usan Géneros y Categorías, que en el backend comparten el mismo esquema.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fila = Record<string, any>;

interface Props {
  ruta: string;        // segmento de la API: "generos" | "categoria"
  clave: string;       // clave de la lista en la respuesta GET
  idCampo: string;     // "id_genero" | "id_categoria"
  icono: string;
  titulo: string;      // "Géneros"
  singular: string;    // "género"
  femenino: boolean;
  descripcion: string; // subtítulo de la sección
}

function CatalogoAdmin({
  ruta,
  clave,
  idCampo,
  icono,
  titulo,
  singular,
  femenino,
  descripcion,
}: Props) {

  const [items, setItems] = useState<Fila[]>([]);
  const [seleccionado, setSeleccionado] = useState<Fila | null>(null);
  const [editando, setEditando] = useState<Fila | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [errorForm, setErrorForm] = useState("");

  const nuevoTexto = femenino ? "NUEVA" : "NUEVO";


  // =========================
  // OBTENER
  // =========================

  const cargar = async () => {

    setCargando(true);

    const r = await adminPeticion(`/${ruta}`, {}, `Error obteniendo ${titulo.toLowerCase()}`);

    if (r.ok) setItems(r.datos[clave] || []);
    else setAviso({ ok: false, texto: r.error });

    setCargando(false);

  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruta]);


  // =========================
  // GUARDAR
  // =========================

  const guardar = async () => {

    if (!editando) return;

    if (!String(editando.nombre ?? "").trim()) {
      setErrorForm(`Escribe el nombre ${femenino ? "de la" : "del"} ${singular}`);
      return;
    }

    setErrorForm("");
    setGuardando(true);

    const esEdicion = !!editando[idCampo];

    const r = await adminPeticion(
      esEdicion ? `/${ruta}/${editando[idCampo]}` : `/${ruta}`,
      {
        method: esEdicion ? "PUT" : "POST",
        body: JSON.stringify({
          nombre: String(editando.nombre).trim(),
          descripcion: editando.descripcion,
        }),
      },
      `Error guardando ${femenino ? "la" : "el"} ${singular}`
    );

    setGuardando(false);

    if (!r.ok) {
      setErrorForm(r.error);
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Guardado"} ✅` });
    setEditando(null);
    cargar();

  };


  // =========================
  // ELIMINAR
  // =========================

  const eliminar = async (id: number) => {

    if (!window.confirm(`¿Seguro que quieres eliminar ${femenino ? "esta" : "este"} ${singular}?`)) {
      return;
    }

    const r = await adminPeticion(
      `/${ruta}/${id}`,
      { method: "DELETE" },
      `No se pudo eliminar ${femenino ? "la" : "el"} ${singular}`
    );

    if (!r.ok) {
      // Si hay juegos que lo usan, el backend responde 409 con el motivo
      setAviso({ ok: false, texto: r.error });
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Eliminado"} ✅` });
    cargar();

  };


  return (

    <>

      {/* ENCABEZADO */}

      <div className="admin-section-header">

        <div>
          <h2>{icono} {titulo}</h2>
          <p>{descripcion}</p>
        </div>

        <button
          className="admin-add-button"
          onClick={() => {
            setErrorForm("");
            setEditando({ nombre: "", descripcion: "" });
          }}
        >
          + Agregar {singular}
        </button>

      </div>


      {aviso && (
        <p className={`adm-aviso ${aviso.ok ? "ok" : "error"}`}>{aviso.texto}</p>
      )}


      {/* TABLA */}

      {cargando ? (

        <div className="admin-empty">Cargando {titulo.toLowerCase()}...</div>

      ) : items.length === 0 ? (

        <div className="admin-empty">
          No hay {titulo.toLowerCase()} registrad{femenino ? "as" : "os"}.
        </div>

      ) : (

        <div className="admin-tabla">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {items.map((item) => (

                <tr key={item[idCampo]}>

                  <td>{item[idCampo]}</td>
                  <td><strong>{item.nombre}</strong></td>
                  <td className="adm-celda-corta">{item.descripcion || "—"}</td>
                  <td>{fechaCorta(item.fecha_creacion)}</td>

                  <td>

                    <button className="admin-ver" onClick={() => setSeleccionado(item)} title="Ver detalles">
                      👁️
                    </button>

                    <button
                      className="admin-editar"
                      onClick={() => {
                        setErrorForm("");
                        setEditando({ ...item });
                      }}
                      title={`Editar ${singular}`}
                    >
                      ✏️
                    </button>

                    <button
                      className="admin-eliminar"
                      onClick={() => eliminar(item[idCampo])}
                      title={`Eliminar ${singular}`}
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
                <span>
                  {editando[idCampo]
                    ? `EDITAR ${singular.toUpperCase()}`
                    : `${nuevoTexto} ${singular.toUpperCase()}`}
                </span>
                <h2>
                  {editando[idCampo] ? "✏️ Editar" : `${icono} Agregar`} {singular}
                </h2>
              </div>

              <button className="admin-modal-cerrar" onClick={() => setEditando(null)}>
                ✕
              </button>

            </div>


            <div className="adm-form" style={{ marginTop: 8 }}>

              <div className="adm-campo ancho">
                <label>Nombre *</label>
                <input
                  value={editando.nombre ?? ""}
                  onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                  maxLength={100}
                  placeholder={`Nombre ${femenino ? "de la" : "del"} ${singular}`}
                />
              </div>

              <div className="adm-campo ancho">
                <label>Descripción</label>
                <textarea
                  value={editando.descripcion ?? ""}
                  onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                  placeholder={`Descripción ${femenino ? "de la" : "del"} ${singular}`}
                />
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

      {seleccionado && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>
                <span>DETALLES {femenino ? "DE LA" : "DEL"} {singular.toUpperCase()}</span>
                <h2>{seleccionado.nombre}</h2>
              </div>

              <button className="admin-modal-cerrar" onClick={() => setSeleccionado(null)}>
                ✕
              </button>

            </div>


            <div className="admin-detalles-grid">

              <div className="admin-detalle">
                <span>ID</span>
                <strong>{seleccionado[idCampo]}</strong>
              </div>

              <div className="admin-detalle">
                <span>Nombre</span>
                <strong>{seleccionado.nombre}</strong>
              </div>

              <div className="admin-detalle">
                <span>Fecha de creación</span>
                <strong>{fechaCorta(seleccionado.fecha_creacion)}</strong>
              </div>

            </div>


            <div className="admin-detalle-grande">
              <span>Descripción</span>
              <p>{seleccionado.descripcion || "Sin descripción"}</p>
            </div>

          </div>

        </div>

      )}

    </>

  );

}

export default CatalogoAdmin;

import { useEffect, useState } from "react";
import { adminPeticion, aNumero, soloFecha, fechaCorta } from "../adminApi";
import "../AdminFormulario.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fila = Record<string, any>;

const juegoVacio = (): Fila => ({
  nombre: "",
  descripcion: "",
  fecha_lanzamiento: "",
  imagen: "",
  portada: "",
  trailer: "",
  edad_minima: "",
  idiomas_disponibles: "",
  requisitos_minimos: "",
  requisitos_recomendados: "",
  modo_juego: "",
  estado: "Activo",
  id_categoria: "",
  id_genero: "",
  id_desarrollador: "",
});

const opciones = (lista: Fila[], id: string) =>
  lista.map((o) => (
    <option key={o[id]} value={o[id]}>
      {o.nombre}
    </option>
  ));

function JuegosAdmin() {

  const [juegos, setJuegos] = useState<Fila[]>([]);
  const [categorias, setCategorias] = useState<Fila[]>([]);
  const [generos, setGeneros] = useState<Fila[]>([]);
  const [desarrolladores, setDesarrolladores] = useState<Fila[]>([]);

  const [seleccionado, setSeleccionado] = useState<Fila | null>(null);
  const [editando, setEditando] = useState<Fila | null>(null);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [errorForm, setErrorForm] = useState("");


  // =========================
  // CARGAR DATOS
  // =========================

  const cargarJuegos = async () => {

    setCargando(true);

    const r = await adminPeticion("/juegos", {}, "Error obteniendo juegos");

    if (r.ok) setJuegos(r.datos.juegos || []);
    else setAviso({ ok: false, texto: r.error });

    setCargando(false);

  };

  // Listas para los selectores del formulario
  const cargarOpciones = async () => {

    const [c, g, d] = await Promise.all([
      adminPeticion("/categoria"),
      adminPeticion("/generos"),
      adminPeticion("/desarrolladores"),
    ]);

    if (c.ok) setCategorias(c.datos.categoria || []);
    if (g.ok) setGeneros(g.datos.generos || []);
    if (d.ok) setDesarrolladores(d.datos.desarrolladores || []);

  };

  useEffect(() => {
    cargarJuegos();
    cargarOpciones();
  }, []);


  // =========================
  // FORMULARIO
  // =========================

  const nuevo = () => {
    setErrorForm("");
    setEditando(juegoVacio());
  };

  const editar = (juego: Fila) => {
    setErrorForm("");
    setEditando({
      ...juegoVacio(),
      ...juego,
      fecha_lanzamiento: soloFecha(juego.fecha_lanzamiento),
    });
  };

  const cambiar = (campo: string, valor: string) =>
    setEditando((previo) => (previo ? { ...previo, [campo]: valor } : previo));


  // =========================
  // GUARDAR
  // =========================

  const guardar = async () => {

    if (!editando) return;

    if (!String(editando.nombre ?? "").trim()) {
      setErrorForm("Escribe el nombre del juego");
      return;
    }

    const edad = aNumero(editando.edad_minima);

    if (edad !== null && (edad < 0 || edad > 21)) {
      setErrorForm("La edad mínima debe estar entre 0 y 21");
      return;
    }

    setErrorForm("");
    setGuardando(true);

    const esEdicion = !!editando.id_juego;

    // Solo los campos que acepta el backend (no se envían nombres de joins)
    const cuerpo = {
      nombre: String(editando.nombre).trim(),
      descripcion: editando.descripcion,
      fecha_lanzamiento: soloFecha(editando.fecha_lanzamiento) || null,
      imagen: editando.imagen,
      portada: editando.portada,
      trailer: editando.trailer,
      edad_minima: edad,
      idiomas_disponibles: editando.idiomas_disponibles,
      requisitos_minimos: editando.requisitos_minimos,
      requisitos_recomendados: editando.requisitos_recomendados,
      modo_juego: editando.modo_juego,
      estado: editando.estado,
      id_categoria: aNumero(editando.id_categoria),
      id_genero: aNumero(editando.id_genero),
      id_desarrollador: aNumero(editando.id_desarrollador),
    };

    const r = await adminPeticion(
      esEdicion ? `/juegos/${editando.id_juego}` : "/juegos",
      { method: esEdicion ? "PUT" : "POST", body: JSON.stringify(cuerpo) },
      "Error guardando el juego"
    );

    setGuardando(false);

    if (!r.ok) {
      setErrorForm(r.error);
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Juego guardado"} ✅` });
    setEditando(null);
    cargarJuegos();

  };


  // =========================
  // ELIMINAR
  // =========================

  const eliminar = async (id: number) => {

    if (!window.confirm("¿Seguro que quieres eliminar este juego?")) return;

    const r = await adminPeticion(`/juegos/${id}`, { method: "DELETE" }, "No se pudo eliminar el juego");

    if (!r.ok) {
      setAviso({ ok: false, texto: r.error });
      return;
    }

    setAviso({ ok: true, texto: `${r.datos.mensaje || "Juego eliminado"} ✅` });
    cargarJuegos();

  };


  return (
    <>

      {/* ENCABEZADO */}

      <div className="admin-section-header">

        <div>
          <h2>🎮 Juegos</h2>
          <p>Administra los juegos de PromoHunt</p>
        </div>

        <button className="admin-add-button" onClick={nuevo}>
          + Agregar juego
        </button>

      </div>


      {aviso && (
        <p className={`adm-aviso ${aviso.ok ? "ok" : "error"}`}>{aviso.texto}</p>
      )}


      {/* TABLA */}

      {cargando ? (

        <div className="admin-empty">Cargando juegos...</div>

      ) : juegos.length === 0 ? (

        <div className="admin-empty">No hay juegos registrados.</div>

      ) : (

        <div className="admin-tabla">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Juego</th>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Género</th>
                <th>Desarrollador</th>
                <th>Edad</th>
                <th>Modo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {juegos.map((juego) => (

                <tr key={juego.id_juego}>

                  <td>{juego.id_juego}</td>
                  <td><strong>{juego.nombre}</strong></td>
                  <td>{fechaCorta(juego.fecha_lanzamiento)}</td>
                  <td>{juego.categoria || "—"}</td>
                  <td>{juego.genero || "—"}</td>
                  <td>{juego.desarrollador || "—"}</td>
                  <td>{juego.edad_minima ?? "—"}</td>
                  <td>{juego.modo_juego || "—"}</td>
                  <td>{juego.estado || "—"}</td>

                  <td>

                    <button className="admin-ver" onClick={() => setSeleccionado(juego)} title="Ver detalles">
                      👁️
                    </button>

                    <button className="admin-editar" onClick={() => editar(juego)} title="Editar juego">
                      ✏️
                    </button>

                    <button className="admin-eliminar" onClick={() => eliminar(juego.id_juego)} title="Eliminar juego">
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
                <span>{editando.id_juego ? "EDITAR JUEGO" : "NUEVO JUEGO"}</span>
                <h2>{editando.id_juego ? "✏️ Editar juego" : "🎮 Agregar juego"}</h2>
              </div>

              <button className="admin-modal-cerrar" onClick={() => setEditando(null)}>
                ✕
              </button>

            </div>


            <div className="adm-modal-cuerpo">

              <div className="adm-form">

                <span className="adm-seccion">Información general</span>

                <div className="adm-campo ancho">
                  <label>Nombre *</label>
                  <input
                    value={editando.nombre ?? ""}
                    onChange={(e) => cambiar("nombre", e.target.value)}
                    maxLength={150}
                    placeholder="Nombre del juego"
                  />
                </div>

                <div className="adm-campo">
                  <label>Fecha de lanzamiento</label>
                  <input
                    type="date"
                    value={editando.fecha_lanzamiento ?? ""}
                    onChange={(e) => cambiar("fecha_lanzamiento", e.target.value)}
                  />
                </div>

                <div className="adm-campo">
                  <label>Estado</label>
                  <select
                    value={editando.estado ?? "Activo"}
                    onChange={(e) => cambiar("estado", e.target.value)}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="adm-campo ancho">
                  <label>Descripción</label>
                  <textarea
                    value={editando.descripcion ?? ""}
                    onChange={(e) => cambiar("descripcion", e.target.value)}
                    placeholder="De qué trata el juego"
                  />
                </div>


                <span className="adm-seccion">Clasificación</span>

                <div className="adm-campo">
                  <label>Categoría</label>
                  <select
                    value={editando.id_categoria ?? ""}
                    onChange={(e) => cambiar("id_categoria", e.target.value)}
                  >
                    <option value="">Sin categoría</option>
                    {opciones(categorias, "id_categoria")}
                  </select>
                </div>

                <div className="adm-campo">
                  <label>Género</label>
                  <select
                    value={editando.id_genero ?? ""}
                    onChange={(e) => cambiar("id_genero", e.target.value)}
                  >
                    <option value="">Sin género</option>
                    {opciones(generos, "id_genero")}
                  </select>
                </div>

                <div className="adm-campo">
                  <label>Desarrollador</label>
                  <select
                    value={editando.id_desarrollador ?? ""}
                    onChange={(e) => cambiar("id_desarrollador", e.target.value)}
                  >
                    <option value="">Sin desarrollador</option>
                    {opciones(desarrolladores, "id_desarrollador")}
                  </select>
                </div>

                <div className="adm-campo">
                  <label>Edad mínima</label>
                  <input
                    type="number"
                    min="0"
                    max="21"
                    value={editando.edad_minima ?? ""}
                    onChange={(e) => cambiar("edad_minima", e.target.value)}
                    placeholder="Ej: 16"
                  />
                </div>

                <div className="adm-campo ancho">
                  <label>Modo de juego</label>
                  <input
                    value={editando.modo_juego ?? ""}
                    onChange={(e) => cambiar("modo_juego", e.target.value)}
                    maxLength={100}
                    placeholder="Ej: Un jugador, Multijugador"
                  />
                </div>


                <span className="adm-seccion">Multimedia</span>

                <div className="adm-campo">
                  <label>Imagen</label>
                  <input
                    value={editando.imagen ?? ""}
                    onChange={(e) => cambiar("imagen", e.target.value)}
                    maxLength={255}
                    placeholder="Archivo o URL"
                  />
                </div>

                <div className="adm-campo">
                  <label>Portada</label>
                  <input
                    value={editando.portada ?? ""}
                    onChange={(e) => cambiar("portada", e.target.value)}
                    maxLength={255}
                    placeholder="Archivo o URL"
                  />
                </div>

                <div className="adm-campo ancho">
                  <label>Tráiler</label>
                  <input
                    value={editando.trailer ?? ""}
                    onChange={(e) => cambiar("trailer", e.target.value)}
                    maxLength={255}
                    placeholder="https://..."
                  />
                </div>


                <span className="adm-seccion">Detalles técnicos</span>

                <div className="adm-campo ancho">
                  <label>Idiomas disponibles</label>
                  <textarea
                    value={editando.idiomas_disponibles ?? ""}
                    onChange={(e) => cambiar("idiomas_disponibles", e.target.value)}
                    placeholder="Español, Inglés..."
                  />
                </div>

                <div className="adm-campo">
                  <label>Requisitos mínimos</label>
                  <textarea
                    value={editando.requisitos_minimos ?? ""}
                    onChange={(e) => cambiar("requisitos_minimos", e.target.value)}
                  />
                </div>

                <div className="adm-campo">
                  <label>Requisitos recomendados</label>
                  <textarea
                    value={editando.requisitos_recomendados ?? ""}
                    onChange={(e) => cambiar("requisitos_recomendados", e.target.value)}
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
                {guardando ? "Guardando..." : "💾 Guardar"}
              </button>

            </div>

          </div>

        </div>

      )}


      {/* MODAL DETALLES */}

      {seleccionado && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>
                <span>DETALLES DEL JUEGO</span>
                <h2>{seleccionado.nombre}</h2>
              </div>

              <button className="admin-modal-cerrar" onClick={() => setSeleccionado(null)}>
                ✕
              </button>

            </div>


            <div className="adm-modal-cuerpo">

              <div className="admin-detalles-grid">

                <div className="admin-detalle">
                  <span>Categoría</span>
                  <strong>{seleccionado.categoria || "—"}</strong>
                </div>

                <div className="admin-detalle">
                  <span>Género</span>
                  <strong>{seleccionado.genero || "—"}</strong>
                </div>

                <div className="admin-detalle">
                  <span>Desarrollador</span>
                  <strong>{seleccionado.desarrollador || "—"}</strong>
                </div>

                <div className="admin-detalle">
                  <span>Edad mínima</span>
                  <strong>{seleccionado.edad_minima ?? "—"}</strong>
                </div>

                <div className="admin-detalle">
                  <span>Modo</span>
                  <strong>{seleccionado.modo_juego || "—"}</strong>
                </div>

                <div className="admin-detalle">
                  <span>Estado</span>
                  <strong>{seleccionado.estado || "—"}</strong>
                </div>

              </div>

              <div className="admin-detalle-grande">
                <span>Descripción</span>
                <p>{seleccionado.descripcion || "Sin descripción"}</p>
              </div>

              <div className="admin-detalle-grande">
                <span>Idiomas disponibles</span>
                <p>{seleccionado.idiomas_disponibles || "—"}</p>
              </div>

              <div className="admin-detalle-grande">
                <span>Requisitos mínimos</span>
                <p>{seleccionado.requisitos_minimos || "—"}</p>
              </div>

              <div className="admin-detalle-grande">
                <span>Requisitos recomendados</span>
                <p>{seleccionado.requisitos_recomendados || "—"}</p>
              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default JuegosAdmin;

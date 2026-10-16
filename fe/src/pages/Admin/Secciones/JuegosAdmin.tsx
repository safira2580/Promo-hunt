import { useEffect, useState } from "react";

function JuegosAdmin() {

  const [juegos, setJuegos] = useState<any[]>([]);
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<any | null>(null);
  const [juegoEditando, setJuegoEditando] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);

  // =========================
  // OBTENER JUEGOS
  // =========================

  const obtenerJuegos = async () => {

    setCargando(true);

    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/admin/juegos",
        {
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.mensaje);
        return;
      }

      setJuegos(datos.juegos);

    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    } finally {

      setCargando(false);

    }
  };

  useEffect(() => {
    obtenerJuegos();
  }, []);

  // =========================
  // GUARDAR
  // =========================

  const guardarJuego = async () => {

    if (!juegoEditando.nombre) {
      alert("Escribe el nombre del juego");
      return;
    }

    const editar = !!juegoEditando.id_juego;

    try {

      const respuesta = await fetch(
        editar
          ? `http://localhost:5000/api/admin/juegos/${juegoEditando.id_juego}`
          : "http://localhost:5000/api/admin/juegos",
        {
          method: editar ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(juegoEditando)
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.mensaje);
        return;
      }

      alert(editar ? "Juego actualizado ✅" : "Juego agregado ✅");

      setJuegoEditando(null);

      obtenerJuegos();

    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }
  };

  // =========================
  // ELIMINAR
  // =========================

  const eliminarJuego = async (id: number) => {

    if (!window.confirm("¿Seguro que quieres eliminar este juego?")) {
      return;
    }

    try {

      const respuesta = await fetch(
        `http://localhost:5000/api/admin/juegos/${id}`,
        {
          method: "DELETE",
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        alert(datos.mensaje);
        return;
      }

      setJuegos(
        juegos.filter(juego => juego.id_juego !== id)
      );

      alert("Juego eliminado ✅");

    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }
  };

  // =========================
  // FORMULARIO VACÍO
  // =========================

  const nuevoJuego = () => {

    setJuegoEditando({
      nombre: "",
      descripcion: "",
      fecha_lanzamiento: "",
      edad_minima: "",
      modo_juego: "",
      estado: "Activo"
    });

  };

  return (
    <>

      {/* =========================
          ENCABEZADO
      ========================= */}

      <div className="admin-section-header">

        <div>
          <h2>🎮 Juegos</h2>
          <p>Administra los juegos de PromoHunt</p>
        </div>

        <button
          className="admin-add-button"
          onClick={nuevoJuego}
        >
          + Agregar juego
        </button>

      </div>


      {/* =========================
          TABLA
      ========================= */}

      {cargando ? (

        <div className="admin-empty">
          Cargando juegos...
        </div>

      ) : juegos.length === 0 ? (

        <div className="admin-empty">
          No hay juegos registrados.
        </div>

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

              {juegos.map(juego => (

                <tr key={juego.id_juego}>

                  <td>{juego.id_juego}</td>

                  <td>
                    <strong>{juego.nombre}</strong>
                  </td>

                  <td>
                    {juego.fecha_lanzamiento || "—"}
                  </td>

                  <td>
                    {juego.categoria || "—"}
                  </td>

                  <td>
                    {juego.genero || "—"}
                  </td>

                  <td>
                    {juego.desarrollador || "—"}
                  </td>

                  <td>
                    {juego.edad_minima || "—"}
                  </td>

                  <td>
                    {juego.modo_juego || "—"}
                  </td>

                  <td>
                    {juego.estado || "—"}
                  </td>

                  <td>

                    <button
                      className="admin-ver"
                      onClick={() =>
                        setJuegoSeleccionado(juego)
                      }
                    >
                      👁️
                    </button>

                    <button
                      className="admin-editar"
                      onClick={() =>
                        setJuegoEditando({ ...juego })
                      }
                    >
                      ✏️
                    </button>

                    <button
                      className="admin-eliminar"
                      onClick={() =>
                        eliminarJuego(juego.id_juego)
                      }
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


      {/* =========================
          MODAL AGREGAR / EDITAR
      ========================= */}

      {juegoEditando && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <h2>
              {juegoEditando.id_juego
                ? "✏️ Editar juego"
                : "🎮 Agregar juego"}
            </h2>

            <input
              placeholder="Nombre"
              value={juegoEditando.nombre || ""}
              onChange={e =>
                setJuegoEditando({
                  ...juegoEditando,
                  nombre: e.target.value
                })
              }
            />

            <input
              type="date"
              value={juegoEditando.fecha_lanzamiento || ""}
              onChange={e =>
                setJuegoEditando({
                  ...juegoEditando,
                  fecha_lanzamiento: e.target.value
                })
              }
            />

            <input
              type="number"
              placeholder="Edad mínima"
              value={juegoEditando.edad_minima || ""}
              onChange={e =>
                setJuegoEditando({
                  ...juegoEditando,
                  edad_minima: e.target.value
                })
              }
            />

            <input
              placeholder="Modo de juego"
              value={juegoEditando.modo_juego || ""}
              onChange={e =>
                setJuegoEditando({
                  ...juegoEditando,
                  modo_juego: e.target.value
                })
              }
            />

            <textarea
              placeholder="Descripción"
              value={juegoEditando.descripcion || ""}
              onChange={e =>
                setJuegoEditando({
                  ...juegoEditando,
                  descripcion: e.target.value
                })
              }
            />

            <select
              value={juegoEditando.estado || "Activo"}
              onChange={e =>
                setJuegoEditando({
                  ...juegoEditando,
                  estado: e.target.value
                })
              }
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>


            <div className="admin-modal-footer">

              <button
                className="admin-modal-cancelar"
                onClick={() => setJuegoEditando(null)}
              >
                Cancelar
              </button>

              <button
                className="admin-add-button"
                onClick={guardarJuego}
              >
                💾 Guardar
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          MODAL DETALLES
      ========================= */}

      {juegoSeleccionado && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>
                <span>DETALLES DEL JUEGO</span>

                <h2>
                  {juegoSeleccionado.nombre}
                </h2>
              </div>

              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setJuegoSeleccionado(null)
                }
              >
                ✕
              </button>

            </div>


            <div className="admin-detalles-grid">

              <div className="admin-detalle">
                <span>Categoría</span>
                <strong>
                  {juegoSeleccionado.categoria || "—"}
                </strong>
              </div>

              <div className="admin-detalle">
                <span>Género</span>
                <strong>
                  {juegoSeleccionado.genero || "—"}
                </strong>
              </div>

              <div className="admin-detalle">
                <span>Desarrollador</span>
                <strong>
                  {juegoSeleccionado.desarrollador || "—"}
                </strong>
              </div>

              <div className="admin-detalle">
                <span>Edad mínima</span>
                <strong>
                  {juegoSeleccionado.edad_minima || "—"}
                </strong>
              </div>

              <div className="admin-detalle">
                <span>Modo</span>
                <strong>
                  {juegoSeleccionado.modo_juego || "—"}
                </strong>
              </div>

              <div className="admin-detalle">
                <span>Estado</span>
                <strong>
                  {juegoSeleccionado.estado || "—"}
                </strong>
              </div>

            </div>


            <div className="admin-detalle-grande">

              <span>Descripción</span>

              <p>
                {juegoSeleccionado.descripcion || "Sin descripción"}
              </p>

            </div>


            <div className="admin-detalle-grande">

              <span>Idiomas disponibles</span>

              <p>
                {juegoSeleccionado.idiomas_disponibles || "—"}
              </p>

            </div>


            <div className="admin-detalle-grande">

              <span>Requisitos mínimos</span>

              <p>
                {juegoSeleccionado.requisitos_minimos || "—"}
              </p>

            </div>


            <div className="admin-detalle-grande">

              <span>Requisitos recomendados</span>

              <p>
                {juegoSeleccionado.requisitos_recomendados || "—"}
              </p>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default JuegosAdmin;
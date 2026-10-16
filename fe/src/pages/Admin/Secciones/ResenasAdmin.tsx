import { useEffect, useState } from "react";

function ResenasAdmin() {

  const [resenas, setResenas] = useState<any[]>([]);
  const [resenaSeleccionada, setResenaSeleccionada] = useState<any | null>(null);
  const [resenaEditando, setResenaEditando] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);


  // =================================
  // OBTENER RESEÑAS
  // =================================

  const obtenerResenas = async () => {

    setCargando(true);

    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/admin/resenas",
        {
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {

        alert(datos.mensaje);
        return;

      }

      setResenas(datos.resenas || []);

    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    obtenerResenas();

  }, []);


  // =================================
  // GUARDAR RESEÑA
  // =================================

  const guardarResena = async () => {

    if (!resenaEditando.titulo?.trim()) {

      alert("Escribe el título de la reseña");
      return;

    }


    if (!resenaEditando.comentario?.trim()) {

      alert("Escribe el comentario");
      return;

    }


    const editar = !!resenaEditando.id_resena;


    try {

      const respuesta = await fetch(

        editar
          ? `http://localhost:5000/api/admin/resenas/${resenaEditando.id_resena}`
          : "http://localhost:5000/api/admin/resenas",

        {

          method: editar ? "PUT" : "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(resenaEditando)

        }

      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        alert(datos.mensaje);
        return;

      }


      alert(
        editar
          ? "Reseña actualizada ✅"
          : "Reseña agregada ✅"
      );


      setResenaEditando(null);

      obtenerResenas();


    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }

  };


  // =================================
  // ELIMINAR RESEÑA
  // =================================

  const eliminarResena = async (id: number) => {

    if (
      !window.confirm(
        "¿Seguro que quieres eliminar esta reseña?"
      )
    ) {

      return;

    }


    try {

      const respuesta = await fetch(

        `http://localhost:5000/api/admin/resenas/${id}`,

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


      setResenas(
        resenas.filter(
          resena => resena.id_resena !== id
        )
      );


      alert("Reseña eliminada ✅");


    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }

  };


  // =================================
  // NUEVA RESEÑA
  // =================================

  const nuevaResena = () => {

    setResenaEditando({

      id_usuario: "",
      id_juego: "",
      titulo: "",
      comentario: "",
      calificacion: 5,
      fecha_publicacion: ""

    });

  };


  // =================================
  // FORMATEAR FECHA
  // =================================

  const formatearFecha = (fecha: any) => {

    if (!fecha) {

      return "—";

    }

    const texto = String(fecha);


    if (texto.includes(",")) {

      const fechaJS = new Date(texto);

      if (!isNaN(fechaJS.getTime())) {

        return fechaJS.toLocaleDateString("es-CO");

      }

    }


    return texto.substring(0, 10);

  };


  return (

    <>

      {/* =================================
          ENCABEZADO
      ================================= */}

      <div className="admin-section-header">

        <div>

          <h2>
            ⭐ Reseñas
          </h2>

          <p>
            Administra las reseñas de los
            usuarios de PromoHunt.
          </p>

        </div>


        <button
          className="admin-add-button"
          onClick={nuevaResena}
        >
          + Agregar reseña
        </button>

      </div>


      {/* =================================
          TABLA
      ================================= */}

      {cargando ? (

        <div className="admin-empty">

          Cargando reseñas...

        </div>

      ) : resenas.length === 0 ? (

        <div className="admin-empty">

          No hay reseñas registradas.

        </div>

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

              {resenas.map(resena => (

                <tr key={resena.id_resena}>

                  <td>
                    {resena.id_resena}
                  </td>


                  <td>
                    <strong>
                      {resena.usuario || "—"}
                    </strong>
                  </td>


                  <td>
                    {resena.juego || "—"}
                  </td>


                  <td>
                    {resena.titulo || "—"}
                  </td>


                  <td>
                    {"⭐".repeat(
                      Number(resena.calificacion) || 0
                    )}
                  </td>


                  <td>
                    {formatearFecha(
                      resena.fecha_publicacion
                    )}
                  </td>


                  <td>

                    <button
                      className="admin-ver"
                      onClick={() =>
                        setResenaSeleccionada(resena)
                      }
                    >
                      👁️
                    </button>


                    <button
                      className="admin-editar"
                      onClick={() =>
                        setResenaEditando({
                          ...resena
                        })
                      }
                    >
                      ✏️
                    </button>


                    <button
                      className="admin-eliminar"
                      onClick={() =>
                        eliminarResena(
                          resena.id_resena
                        )
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


      {/* =================================
          MODAL AGREGAR / EDITAR
      ================================= */}

      {resenaEditando && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>

                <span>

                  {resenaEditando.id_resena
                    ? "EDITAR RESEÑA"
                    : "NUEVA RESEÑA"}

                </span>

                <h2>

                  {resenaEditando.id_resena
                    ? "✏️ Editar reseña"
                    : "⭐ Agregar reseña"}

                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setResenaEditando(null)
                }
              >
                ✕
              </button>

            </div>


            <input
              type="number"
              placeholder="ID del usuario"
              value={
                resenaEditando.id_usuario || ""
              }
              onChange={e =>
                setResenaEditando({

                  ...resenaEditando,

                  id_usuario: e.target.value

                })
              }
            />


            <input
              type="number"
              placeholder="ID del juego"
              value={
                resenaEditando.id_juego || ""
              }
              onChange={e =>
                setResenaEditando({

                  ...resenaEditando,

                  id_juego: e.target.value

                })
              }
            />


            <input
              placeholder="Título"
              value={
                resenaEditando.titulo || ""
              }
              onChange={e =>
                setResenaEditando({

                  ...resenaEditando,

                  titulo: e.target.value

                })
              }
            />


            <textarea
              placeholder="Comentario"
              value={
                resenaEditando.comentario || ""
              }
              onChange={e =>
                setResenaEditando({

                  ...resenaEditando,

                  comentario: e.target.value

                })
              }
            />


            <input
              type="number"
              min="1"
              max="5"
              placeholder="Calificación"
              value={
                resenaEditando.calificacion || ""
              }
              onChange={e =>
                setResenaEditando({

                  ...resenaEditando,

                  calificacion: e.target.value

                })
              }
            />


            <div className="admin-modal-footer">

              <button
                className="admin-modal-cancelar"
                onClick={() =>
                  setResenaEditando(null)
                }
              >
                Cancelar
              </button>


              <button
                className="admin-add-button"
                onClick={guardarResena}
              >
                💾 Guardar
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================
          MODAL VER
      ================================= */}

      {resenaSeleccionada && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">


            <div className="admin-modal-header">

              <div>

                <span>
                  DETALLES DE LA RESEÑA
                </span>

                <h2>
                  {resenaSeleccionada.titulo}
                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setResenaSeleccionada(null)
                }
              >
                ✕
              </button>

            </div>


            <div className="admin-detalles-grid">


              <div className="admin-detalle">

                <span>
                  Usuario
                </span>

                <strong>
                  {resenaSeleccionada.usuario || "—"}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  Juego
                </span>

                <strong>
                  {resenaSeleccionada.juego || "—"}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  Calificación
                </span>

                <strong>
                  {"⭐".repeat(
                    Number(
                      resenaSeleccionada.calificacion
                    ) || 0
                  )}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  ID usuario
                </span>

                <strong>
                  {resenaSeleccionada.id_usuario}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  ID juego
                </span>

                <strong>
                  {resenaSeleccionada.id_juego}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  Fecha
                </span>

                <strong>
                  {formatearFecha(
                    resenaSeleccionada.fecha_publicacion
                  )}
                </strong>

              </div>


            </div>


            <div className="admin-detalle-grande">

              <span>
                Comentario
              </span>

              <p>
                {resenaSeleccionada.comentario ||
                  "Sin comentario"}
              </p>

            </div>


          </div>

        </div>

      )}

    </>

  );

}

export default ResenasAdmin;
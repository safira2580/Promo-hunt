import { useEffect, useState } from "react";

function GenerosAdmin() {

  const [generos, setGeneros] = useState<any[]>([]);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<any | null>(null);
  const [generoEditando, setGeneroEditando] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);


  // =================================
  // OBTENER GÉNEROS
  // =================================

  const obtenerGeneros = async () => {

    setCargando(true);

    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/admin/generos",
        {
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {

        alert(datos.mensaje);
        return;

      }

      setGeneros(datos.generos || []);

    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    obtenerGeneros();

  }, []);


  // =================================
  // GUARDAR GÉNERO
  // =================================

  const guardarGenero = async () => {

    if (!generoEditando.nombre?.trim()) {

      alert("Escribe el nombre del género");
      return;

    }


    const editar = !!generoEditando.id_genero;


    try {

      const respuesta = await fetch(

        editar
          ? `http://localhost:5000/api/admin/generos/${generoEditando.id_genero}`
          : "http://localhost:5000/api/admin/generos",

        {

          method: editar ? "PUT" : "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(generoEditando)

        }

      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        alert(datos.mensaje);
        return;

      }


      alert(
        editar
          ? "Género actualizado ✅"
          : "Género agregado ✅"
      );


      setGeneroEditando(null);

      obtenerGeneros();


    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }

  };


  // =================================
  // ELIMINAR GÉNERO
  // =================================

  const eliminarGenero = async (id: number) => {

    if (
      !window.confirm(
        "¿Seguro que quieres eliminar este género?"
      )
    ) {

      return;

    }


    try {

      const respuesta = await fetch(

        `http://localhost:5000/api/admin/generos/${id}`,

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


      setGeneros(
        generos.filter(
          genero => genero.id_genero !== id
        )
      );


      alert("Género eliminado ✅");


    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }

  };


  // =================================
  // NUEVO GÉNERO
  // =================================

  const nuevoGenero = () => {

    setGeneroEditando({

      nombre: "",
      descripcion: "",
      fecha_creacion: ""

    });

  };


  // =================================
  // FECHA
  // =================================

  const formatearFecha = (fecha: any) => {

    if (!fecha) {
      return "—";
    }

    const texto = String(fecha);

    // Si viene como:
    // Tue, 16 Jun 2026 07:58:08 GMT

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
            🎭 Géneros
          </h2>

          <p>
            Administra los géneros de los juegos
            de PromoHunt.
          </p>

        </div>


        <button
          className="admin-add-button"
          onClick={nuevoGenero}
        >
          + Agregar género
        </button>

      </div>


      {/* =================================
          TABLA
      ================================= */}

      {cargando ? (

        <div className="admin-empty">

          Cargando géneros...

        </div>

      ) : generos.length === 0 ? (

        <div className="admin-empty">

          No hay géneros registrados.

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

              {generos.map(genero => (

                <tr key={genero.id_genero}>

                  <td>
                    {genero.id_genero}
                  </td>


                  <td>

                    <strong>
                      {genero.nombre}
                    </strong>

                  </td>


                  <td>
                    {genero.descripcion || "—"}
                  </td>


                  <td>
                    {formatearFecha(
                      genero.fecha_creacion
                    )}
                  </td>


                  <td>

                    <button
                      className="admin-ver"
                      onClick={() =>
                        setGeneroSeleccionado(genero)
                      }
                    >
                      👁️
                    </button>


                    <button
                      className="admin-editar"
                      onClick={() =>
                        setGeneroEditando({
                          ...genero
                        })
                      }
                    >
                      ✏️
                    </button>


                    <button
                      className="admin-eliminar"
                      onClick={() =>
                        eliminarGenero(
                          genero.id_genero
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

      {generoEditando && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>

                <span>
                  {generoEditando.id_genero
                    ? "EDITAR GÉNERO"
                    : "NUEVO GÉNERO"}
                </span>

                <h2>

                  {generoEditando.id_genero
                    ? "✏️ Editar género"
                    : "🎭 Agregar género"}

                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setGeneroEditando(null)
                }
              >
                ✕
              </button>

            </div>


            <input
              placeholder="Nombre del género"
              value={
                generoEditando.nombre || ""
              }
              onChange={e =>
                setGeneroEditando({

                  ...generoEditando,

                  nombre: e.target.value

                })
              }
            />


            <textarea
              placeholder="Descripción del género"
              value={
                generoEditando.descripcion || ""
              }
              onChange={e =>
                setGeneroEditando({

                  ...generoEditando,

                  descripcion: e.target.value

                })
              }
            />


            <div className="admin-modal-footer">

              <button
                className="admin-modal-cancelar"
                onClick={() =>
                  setGeneroEditando(null)
                }
              >
                Cancelar
              </button>


              <button
                className="admin-add-button"
                onClick={guardarGenero}
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

      {generoSeleccionado && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">


            <div className="admin-modal-header">

              <div>

                <span>
                  DETALLES DEL GÉNERO
                </span>

                <h2>
                  {generoSeleccionado.nombre}
                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setGeneroSeleccionado(null)
                }
              >
                ✕
              </button>

            </div>


            <div className="admin-detalles-grid">


              <div className="admin-detalle">

                <span>
                  ID
                </span>

                <strong>
                  {generoSeleccionado.id_genero}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  Nombre
                </span>

                <strong>
                  {generoSeleccionado.nombre}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  Fecha de creación
                </span>

                <strong>
                  {formatearFecha(
                    generoSeleccionado.fecha_creacion
                  )}
                </strong>

              </div>


            </div>


            <div className="admin-detalle-grande">

              <span>
                Descripción
              </span>

              <p>
                {generoSeleccionado.descripcion ||
                  "Sin descripción"}
              </p>

            </div>


          </div>

        </div>

      )}

    </>

  );

}

export default GenerosAdmin;
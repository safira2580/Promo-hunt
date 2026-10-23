import { useEffect, useState } from "react";

function CategoriasAdmin() {

  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<any | null>(null);
  const [categoriaEditando, setCategoriaEditando] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);


  // =================================
  // OBTENER CATEGORÍAS
  // =================================

  const obtenerCategorias = async () => {

    setCargando(true);

    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/admin/categoria",
        {
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {

        alert(datos.mensaje);
        return;

      }

      setCategorias(datos.categoria || []);

    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    } finally {

      setCargando(false);

    }

  };


  useEffect(() => {

    obtenerCategorias();

  }, []);


  // =================================
  // GUARDAR CATEGORÍA
  // =================================

  const guardarCategoria = async () => {

    if (!categoriaEditando.nombre?.trim()) {

      alert("Escribe el nombre de la categoría");
      return;

    }


    const editar = !!categoriaEditando.id_categoria;


    try {

      const respuesta = await fetch(

        editar
          ? `http://localhost:5000/api/admin/categoria/${categoriaEditando.id_categoria}`
          : "http://localhost:5000/api/admin/categoria",

        {

          method: editar ? "PUT" : "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(categoriaEditando)

        }

      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        alert(datos.mensaje);
        return;

      }


      alert(
        editar
          ? "Categoría actualizada ✅"
          : "Categoría agregada ✅"
      );


      setCategoriaEditando(null);

      obtenerCategorias();


    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }

  };


  // =================================
  // ELIMINAR CATEGORÍA
  // =================================

  const eliminarCategoria = async (id: number) => {

    if (
      !window.confirm(
        "¿Seguro que quieres eliminar esta categoría?"
      )
    ) {

      return;

    }


    try {

      const respuesta = await fetch(

        `http://localhost:5000/api/admin/categoria/${id}`,

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


      setCategorias(
        categorias.filter(
          categoria =>
            categoria.id_categoria !== id
        )
      );


      alert("Categoría eliminada ✅");


    } catch (error) {

      console.error(error);
      alert("Error conectando con el servidor");

    }

  };


  // =================================
  // NUEVA CATEGORÍA
  // =================================

  const nuevaCategoria = () => {

    setCategoriaEditando({

      nombre: "",
      descripcion: "",
      fecha_creacion: ""

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
            📁 Categorías
          </h2>

          <p>
            Administra las categorías de los
            juegos de PromoHunt.
          </p>

        </div>


        <button
          className="admin-add-button"
          onClick={nuevaCategoria}
        >
          + Agregar categoría
        </button>

      </div>


      {/* =================================
          TABLA
      ================================= */}

      {cargando ? (

        <div className="admin-empty">

          Cargando categorías...

        </div>

      ) : categorias.length === 0 ? (

        <div className="admin-empty">

          No hay categorías registradas.

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

              {categorias.map(categoria => (

                <tr key={categoria.id_categoria}>

                  <td>
                    {categoria.id_categoria}
                  </td>


                  <td>

                    <strong>
                      {categoria.nombre}
                    </strong>

                  </td>


                  <td>
                    {categoria.descripcion || "—"}
                  </td>


                  <td>
                    {formatearFecha(
                      categoria.fecha_creacion
                    )}
                  </td>


                  <td>

                    <button
                      className="admin-ver"
                      onClick={() =>
                        setCategoriaSeleccionada(
                          categoria
                        )
                      }
                    >
                      👁️
                    </button>


                    <button
                      className="admin-editar"
                      onClick={() =>
                        setCategoriaEditando({
                          ...categoria
                        })
                      }
                    >
                      ✏️
                    </button>


                    <button
                      className="admin-eliminar"
                      onClick={() =>
                        eliminarCategoria(
                          categoria.id_categoria
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

      {categoriaEditando && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">

            <div className="admin-modal-header">

              <div>

                <span>

                  {categoriaEditando.id_categoria
                    ? "EDITAR CATEGORÍA"
                    : "NUEVA CATEGORÍA"}

                </span>

                <h2>

                  {categoriaEditando.id_categoria
                    ? "✏️ Editar categoría"
                    : "📁 Agregar categoría"}

                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setCategoriaEditando(null)
                }
              >
                ✕
              </button>

            </div>


            <input
              placeholder="Nombre de la categoría"
              value={
                categoriaEditando.nombre || ""
              }
              onChange={e =>
                setCategoriaEditando({

                  ...categoriaEditando,

                  nombre: e.target.value

                })
              }
            />


            <textarea
              placeholder="Descripción de la categoría"
              value={
                categoriaEditando.descripcion || ""
              }
              onChange={e =>
                setCategoriaEditando({

                  ...categoriaEditando,

                  descripcion: e.target.value

                })
              }
            />


            <div className="admin-modal-footer">

              <button
                className="admin-modal-cancelar"
                onClick={() =>
                  setCategoriaEditando(null)
                }
              >
                Cancelar
              </button>


              <button
                className="admin-add-button"
                onClick={guardarCategoria}
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

      {categoriaSeleccionada && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">


            <div className="admin-modal-header">

              <div>

                <span>
                  DETALLES DE LA CATEGORÍA
                </span>

                <h2>
                  {categoriaSeleccionada.nombre}
                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setCategoriaSeleccionada(null)
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
                  {categoriaSeleccionada.id_categoria}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  Nombre
                </span>

                <strong>
                  {categoriaSeleccionada.nombre}
                </strong>

              </div>


              <div className="admin-detalle">

                <span>
                  Fecha de creación
                </span>

                <strong>
                  {formatearFecha(
                    categoriaSeleccionada.fecha_creacion
                  )}
                </strong>

              </div>


            </div>


            <div className="admin-detalle-grande">

              <span>
                Descripción
              </span>

              <p>
                {categoriaSeleccionada.descripcion ||
                  "Sin descripción"}
              </p>

            </div>


          </div>

        </div>

      )}

    </>

  );

}

export default CategoriasAdmin;
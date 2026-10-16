import { useEffect, useState } from "react";

function DesarrolladoresAdmin() {

  const [desarrolladores, setDesarrolladores] = useState<any[]>([]);
  const [desarrolladorEditando, setDesarrolladorEditando] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);


  // =========================
  // OBTENER DESARROLLADORES
  // =========================

  const obtenerDesarrolladores = async () => {

    setCargando(true);

    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/admin/desarrolladores",
        {
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      console.log(
        "DESARROLLADORES:",
        datos
      );

      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error obteniendo desarrolladores"
        );

        return;
      }

      setDesarrolladores(
        datos.desarrolladores || []
      );

    } catch (error) {

      console.error(error);

      alert(
        "Error conectando con el servidor"
      );

    } finally {

      setCargando(false);

    }

  };


  // =========================
  // CARGAR AL INICIAR
  // =========================

  useEffect(() => {

    obtenerDesarrolladores();

  }, []);


  // =========================
  // NUEVO DESARROLLADOR
  // =========================

  const nuevoDesarrollador = () => {

    setDesarrolladorEditando({

      nombre: "",
      pais: "",
      ciudad: "",
      fundacion: "",
      sitio_web: "",
      logo: "",
      descripcion: ""

    });

  };


  // =========================
  // EDITAR
  // =========================

  const editarDesarrollador = (
    desarrollador: any
  ) => {

    let fecha = "";

    if (desarrollador.fundacion) {

      fecha =
        String(
          desarrollador.fundacion
        ).substring(0, 10);

    }

    setDesarrolladorEditando({

      ...desarrollador,

      fundacion: fecha

    });

  };


  // =========================
  // GUARDAR
  // =========================

  const guardarDesarrollador = async () => {

    if (!desarrolladorEditando) {
      return;
    }


    if (
      !desarrolladorEditando.nombre
        ?.trim()
    ) {

      alert(
        "Escribe el nombre del desarrollador"
      );

      return;
    }


    const editar =
      !!desarrolladorEditando.id_desarrollador;


    try {

      const respuesta = await fetch(

        editar

          ? `http://localhost:5000/api/admin/desarrolladores/${desarrolladorEditando.id_desarrollador}`

          : "http://localhost:5000/api/admin/desarrolladores",

        {

          method:
            editar
              ? "PUT"
              : "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            nombre:
              desarrolladorEditando.nombre,

            pais:
              desarrolladorEditando.pais,

            ciudad:
              desarrolladorEditando.ciudad,

            fundacion:
              desarrolladorEditando.fundacion
                || null,

            sitio_web:
              desarrolladorEditando.sitio_web,

            logo:
              desarrolladorEditando.logo,

            descripcion:
              desarrolladorEditando.descripcion

          })

        }

      );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error guardando desarrollador"
        );

        return;
      }


      alert(

        editar

          ? "Desarrollador actualizado ✅"

          : "Desarrollador agregado ✅"

      );


      setDesarrolladorEditando(null);

      obtenerDesarrolladores();


    } catch (error) {

      console.error(error);

      alert(
        "Error conectando con el servidor"
      );

    }

  };


  // =========================
  // ELIMINAR
  // =========================

  const eliminarDesarrollador = async (
    id: number
  ) => {

    if (
      !window.confirm(
        "¿Seguro que quieres eliminar este desarrollador?"
      )
    ) {

      return;

    }


    try {

      const respuesta = await fetch(

        `http://localhost:5000/api/admin/desarrolladores/${id}`,

        {

          method: "DELETE",

          credentials: "include"

        }

      );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "No se pudo eliminar el desarrollador"
        );

        return;

      }


      alert(
        "Desarrollador eliminado ✅"
      );


      obtenerDesarrolladores();


    } catch (error) {

      console.error(error);

      alert(
        "Error conectando con el servidor"
      );

    }

  };


  // =========================
  // CARGANDO
  // =========================

  if (cargando) {

    return (

      <div className="admin-empty">

        Cargando desarrolladores...

      </div>

    );

  }


  // =========================
  // INTERFAZ
  // =========================

  return (

    <>

      {/* =========================
          ENCABEZADO
      ========================= */}

      <div className="admin-section-header">

        <div>

          <h2>
            👨‍💻 Desarrolladores
          </h2>

          <p>
            Administra los desarrolladores de PromoHunt
          </p>

        </div>


        <button
          className="admin-add-button"
          onClick={
            nuevoDesarrollador
          }
        >

          + Agregar desarrollador

        </button>

      </div>


      {/* =========================
          TABLA
      ========================= */}

      {desarrolladores.length === 0 ? (

        <div className="admin-empty">

          No hay desarrolladores registrados.

        </div>

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

              {desarrolladores.map(
                desarrollador => (

                  <tr
                    key={
                      desarrollador.id_desarrollador
                    }
                  >

                    <td>
                      {
                        desarrollador.id_desarrollador
                      }
                    </td>


                    <td>

                      <strong>
                        {
                          desarrollador.nombre
                        }
                      </strong>

                    </td>


                    <td>
                      {
                        desarrollador.pais
                          || "—"
                      }
                    </td>


                    <td>
                      {
                        desarrollador.ciudad
                          || "—"
                      }
                    </td>


                    <td>
                      {
                        desarrollador.fundacion
                          ? String(
                              desarrollador.fundacion
                            ).substring(0, 10)
                          : "—"
                      }
                    </td>


                    <td>

                      {
                        desarrollador.sitio_web
                          || "—"
                      }

                    </td>


                    <td>

                      {
                        desarrollador.logo
                          || "—"
                      }

                    </td>


                    <td>

                      {
                        desarrollador.descripcion
                          || "—"
                      }

                    </td>


                    {/* ACCIONES */}

                    <td>

                      <button
                        className="admin-editar"
                        onClick={() =>
                          editarDesarrollador(
                            desarrollador
                          )
                        }
                        title="Editar desarrollador"
                      >

                        ✏️

                      </button>


                      <button
                        className="admin-eliminar"
                        onClick={() =>
                          eliminarDesarrollador(
                            desarrollador.id_desarrollador
                          )
                        }
                        title="Eliminar desarrollador"
                      >

                        🗑️

                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}


      {/* =========================
          MODAL AGREGAR / EDITAR
      ========================= */}

      {desarrolladorEditando && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">


            {/* CABECERA */}

            <div className="admin-modal-header">

              <div>

                <span>
                  GESTIÓN
                </span>

                <h2>

                  {
                    desarrolladorEditando.id_desarrollador

                      ? "✏️ Editar desarrollador"

                      : "👨‍💻 Agregar desarrollador"
                  }

                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setDesarrolladorEditando(null)
                }
              >

                ✕

              </button>

            </div>


            {/* =========================
                FORMULARIO
            ========================= */}


            <input
              placeholder="Nombre"
              value={
                desarrolladorEditando.nombre
                  || ""
              }
              onChange={e =>
                setDesarrolladorEditando({

                  ...desarrolladorEditando,

                  nombre:
                    e.target.value

                })
              }
            />


            <input
              placeholder="País"
              value={
                desarrolladorEditando.pais
                  || ""
              }
              onChange={e =>
                setDesarrolladorEditando({

                  ...desarrolladorEditando,

                  pais:
                    e.target.value

                })
              }
            />


            <input
              placeholder="Ciudad"
              value={
                desarrolladorEditando.ciudad
                  || ""
              }
              onChange={e =>
                setDesarrolladorEditando({

                  ...desarrolladorEditando,

                  ciudad:
                    e.target.value

                })
              }
            />


            <input
              type="date"
              value={
                desarrolladorEditando.fundacion
                  || ""
              }
              onChange={e =>
                setDesarrolladorEditando({

                  ...desarrolladorEditando,

                  fundacion:
                    e.target.value

                })
              }
            />


            <input
              placeholder="Sitio web"
              value={
                desarrolladorEditando.sitio_web
                  || ""
              }
              onChange={e =>
                setDesarrolladorEditando({

                  ...desarrolladorEditando,

                  sitio_web:
                    e.target.value

                })
              }
            />


            <input
              placeholder="Logo"
              value={
                desarrolladorEditando.logo
                  || ""
              }
              onChange={e =>
                setDesarrolladorEditando({

                  ...desarrolladorEditando,

                  logo:
                    e.target.value

                })
              }
            />


            <textarea
              placeholder="Descripción"
              value={
                desarrolladorEditando.descripcion
                  || ""
              }
              onChange={e =>
                setDesarrolladorEditando({

                  ...desarrolladorEditando,

                  descripcion:
                    e.target.value

                })
              }
            />


            {/* =========================
                BOTONES
            ========================= */}

            <div className="admin-modal-footer">


              <button
                className="admin-modal-cancelar"
                onClick={() =>
                  setDesarrolladorEditando(null)
                }
              >

                Cancelar

              </button>


              <button
                className="admin-add-button"
                onClick={
                  guardarDesarrollador
                }
              >

                💾{" "}

                {
                  desarrolladorEditando.id_desarrollador

                    ? "Guardar cambios"

                    : "Agregar desarrollador"
                }

              </button>


            </div>


          </div>

        </div>

      )}

    </>

  );

}


export default DesarrolladoresAdmin;
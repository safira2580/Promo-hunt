import { useEffect, useState } from "react";

function DescuentosAdmin() {

  const [descuentos, setDescuentos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descuentoEditando, setDescuentoEditando] = useState<any | null>(null);


  // ============================
  // OBTENER DESCUENTOS
  // ============================

  const obtenerDescuentos = async () => {

    try {

      setCargando(true);

      const respuesta = await fetch(
        "http://localhost:5000/api/admin/descuentos",
        {
          credentials: "include"
        }
      );

      const datos = await respuesta.json();

      console.log("DESCUENTOS:", datos);

      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error obteniendo descuentos"
        );

        return;
      }

      setDescuentos(
        datos.descuentos || []
      );

    } catch (error) {

      console.error(
        "Error obteniendo descuentos:",
        error
      );

      alert(
        "No se pudo conectar con el servidor"
      );

    } finally {

      setCargando(false);

    }

  };


  // ============================
  // CARGAR AL INICIAR
  // ============================

  useEffect(() => {

    obtenerDescuentos();

  }, []);


  // ============================
  // NUEVO DESCUENTO
  // ============================

  const nuevoDescuento = () => {

    setDescuentoEditando({

      id_juego: "",
      id_plataforma: "",

      precio_original: "",
      precio_descuento: "",
      porcentaje_descuento: "",
      ahorro: "",

      fecha_inicio: "",
      fecha_fin: "",

      estado: "Activo"

    });

  };


  // ============================
  // EDITAR DESCUENTO
  // ============================

  const editarDescuento = (descuento: any) => {

    setDescuentoEditando({

      ...descuento,

      fecha_inicio:
        descuento.fecha_inicio || "",

      fecha_fin:
        descuento.fecha_fin || ""

    });

  };


  // ============================
  // GUARDAR DESCUENTO
  // ============================

  const guardarDescuento = async () => {

    if (!descuentoEditando) {
      return;
    }


    // Validaciones básicas

    if (
      !descuentoEditando.id_juego ||
      !descuentoEditando.id_plataforma
    ) {

      alert(
        "Debes ingresar el ID del juego y de la plataforma"
      );

      return;
    }


    if (
      descuentoEditando.precio_original === "" ||
      descuentoEditando.precio_descuento === ""
    ) {

      alert(
        "Debes ingresar los precios"
      );

      return;
    }


    try {

      const editar =
        !!descuentoEditando.id_descuento;


      const respuesta = await fetch(

        editar

          ? `http://localhost:5000/api/admin/descuentos/${descuentoEditando.id_descuento}`

          : "http://localhost:5000/api/admin/descuentos",

        {

          method: editar
            ? "PUT"
            : "POST",

          credentials: "include",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            id_juego:
              descuentoEditando.id_juego,

            id_plataforma:
              descuentoEditando.id_plataforma,

            precio_original:
              descuentoEditando.precio_original,

            precio_descuento:
              descuentoEditando.precio_descuento,

            porcentaje_descuento:
              descuentoEditando.porcentaje_descuento,

            ahorro:
              descuentoEditando.ahorro,

            fecha_inicio:
              descuentoEditando.fecha_inicio || null,

            fecha_fin:
              descuentoEditando.fecha_fin || null,

            estado:
              descuentoEditando.estado

          })

        }

      );


      const datos =
        await respuesta.json();


      if (!respuesta.ok) {

        alert(
          datos.mensaje ||
          "Error guardando descuento"
        );

        return;
      }


      alert(

        editar

          ? "Descuento actualizado correctamente ✅"

          : "Descuento agregado correctamente ✅"

      );


      setDescuentoEditando(null);

      obtenerDescuentos();


    } catch (error) {

      console.error(
        "Error guardando descuento:",
        error
      );

      alert(
        "Error conectando con el servidor"
      );

    }

  };


  // ============================
  // ELIMINAR DESCUENTO
  // ============================

  const eliminarDescuento = async (
    id: number
  ) => {

    const confirmar =
      window.confirm(
        "¿Seguro que quieres eliminar este descuento?"
      );


    if (!confirmar) {
      return;
    }


    try {

      const respuesta = await fetch(

        `http://localhost:5000/api/admin/descuentos/${id}`,

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
          "No se pudo eliminar el descuento"
        );

        return;
      }


      alert(
        "Descuento eliminado correctamente ✅"
      );


      obtenerDescuentos();


    } catch (error) {

      console.error(
        "Error eliminando descuento:",
        error
      );

      alert(
        "Error conectando con el servidor"
      );

    }

  };


  // ============================
  // CARGANDO
  // ============================

  if (cargando) {

    return (

      <div className="admin-empty">

        <p>
          Cargando descuentos...
        </p>

      </div>

    );

  }


  // ============================
  // INTERFAZ
  // ============================

  return (

    <>


      {/* ============================
          ENCABEZADO
      ============================ */}

      <div className="admin-section-header">

        <div>

          <span className="admin-label">
            GESTIÓN
          </span>

          <h2>
            💰 Descuentos
          </h2>

          <p>
            Administra los descuentos de PromoHunt
          </p>

        </div>


        <button
          className="admin-add-button"
          onClick={nuevoDescuento}
        >

          + Agregar descuento

        </button>

      </div>



      {/* ============================
          TABLA
      ============================ */}

      {descuentos.length === 0 ? (

        <div className="admin-empty">

          <p>
            No hay descuentos registrados.
          </p>

        </div>

      ) : (

        <div className="admin-tabla-container">

          <table className="admin-tabla">

            <thead>

              <tr>

                <th>ID</th>

                <th>Juego</th>

                <th>Plataforma</th>

                <th>Precio original</th>

                <th>Precio descuento</th>

                <th>Descuento</th>

                <th>Ahorro</th>

                <th>Inicio</th>

                <th>Fin</th>

                <th>Estado</th>

                <th>Acciones</th>

              </tr>

            </thead>


            <tbody>

              {descuentos.map(
                (descuento) => (

                  <tr
                    key={
                      descuento.id_descuento
                    }
                  >


                    <td>
                      {
                        descuento.id_descuento
                      }
                    </td>


                    <td>
                      {
                        descuento.juego
                      }
                    </td>


                    <td>
                      {
                        descuento.plataforma
                      }
                    </td>


                    <td>
                      $
                      {
                        descuento.precio_original
                      }
                    </td>


                    <td>
                      $
                      {
                        descuento.precio_descuento
                      }
                    </td>


                    <td>

                      <strong>
                        {
                          descuento.porcentaje_descuento
                        }%
                      </strong>

                    </td>


                    <td>
                      $
                      {
                        descuento.ahorro
                      }
                    </td>


                    <td>
                      {
                        descuento.fecha_inicio
                          || "—"
                      }
                    </td>


                    <td>
                      {
                        descuento.fecha_fin
                          || "—"
                      }
                    </td>


                    <td>

                      <span
                        className={
                          descuento.estado ===
                          "Activo"

                            ? "estado-activo"

                            : "estado-inactivo"
                        }
                      >

                        {
                          descuento.estado
                        }

                      </span>

                    </td>


                    {/* ACCIONES */}

                    <td>


                      <button
                        className="admin-editar"
                        onClick={() =>
                          editarDescuento(
                            descuento
                          )
                        }
                        title="Editar descuento"
                      >

                        ✏️

                      </button>


                      <button
                        className="admin-eliminar"
                        onClick={() =>
                          eliminarDescuento(
                            descuento.id_descuento
                          )
                        }
                        title="Eliminar descuento"
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



      {/* ============================
          MODAL AGREGAR / EDITAR
      ============================ */}

      {descuentoEditando && (

        <div className="admin-modal-fondo">

          <div className="admin-modal">


            {/* CABECERA */}

            <div className="admin-modal-header">

              <div>

                <span className="admin-label">
                  GESTIÓN
                </span>

                <h2>

                  {
                    descuentoEditando.id_descuento

                      ? "Editar descuento"

                      : "Agregar descuento"
                  }

                </h2>

              </div>


              <button
                className="admin-modal-cerrar"
                onClick={() =>
                  setDescuentoEditando(null)
                }
              >

                ✕

              </button>

            </div>



            {/* ============================
                FORMULARIO
            ============================ */}

            <div>


              {/* JUEGO */}

              <label>
                ID del juego
              </label>

              <input
                type="number"
                value={
                  descuentoEditando.id_juego
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    id_juego:
                      e.target.value

                  })
                }
                placeholder="Ej: 1"
              />



              {/* PLATAFORMA */}

              <label>
                ID de la plataforma
              </label>

              <input
                type="number"
                value={
                  descuentoEditando.id_plataforma
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    id_plataforma:
                      e.target.value

                  })
                }
                placeholder="Ej: 1"
              />



              {/* PRECIO ORIGINAL */}

              <label>
                Precio original
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  descuentoEditando.precio_original
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    precio_original:
                      e.target.value

                  })
                }
                placeholder="Ej: 60.00"
              />



              {/* PRECIO DESCUENTO */}

              <label>
                Precio con descuento
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  descuentoEditando.precio_descuento
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    precio_descuento:
                      e.target.value

                  })
                }
                placeholder="Ej: 20.00"
              />



              {/* PORCENTAJE */}

              <label>
                Porcentaje de descuento
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  descuentoEditando.porcentaje_descuento
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    porcentaje_descuento:
                      e.target.value

                  })
                }
                placeholder="Ej: 67"
              />



              {/* AHORRO */}

              <label>
                Ahorro
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  descuentoEditando.ahorro
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    ahorro:
                      e.target.value

                  })
                }
                placeholder="Ej: 40.00"
              />



              {/* FECHA INICIO */}

              <label>
                Fecha de inicio
              </label>

              <input
                type="date"
                value={
                  descuentoEditando.fecha_inicio
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    fecha_inicio:
                      e.target.value

                  })
                }
              />



              {/* FECHA FIN */}

              <label>
                Fecha de finalización
              </label>

              <input
                type="date"
                value={
                  descuentoEditando.fecha_fin
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    fecha_fin:
                      e.target.value

                  })
                }
              />



              {/* ESTADO */}

              <label>
                Estado
              </label>

              <select
                value={
                  descuentoEditando.estado
                }
                onChange={(e) =>
                  setDescuentoEditando({

                    ...descuentoEditando,

                    estado:
                      e.target.value

                  })
                }
              >

                <option value="Activo">
                  Activo
                </option>

                <option value="Inactivo">
                  Inactivo
                </option>

              </select>


            </div>



            {/* ============================
                BOTONES
            ============================ */}

            <div className="admin-modal-footer">


              <button
                className="admin-modal-cancelar"
                onClick={() =>
                  setDescuentoEditando(null)
                }
              >

                Cancelar

              </button>


              <button
                className="admin-add-button"
                onClick={guardarDescuento}
              >

                {
                  descuentoEditando.id_descuento

                    ? "Guardar cambios"

                    : "Agregar descuento"
                }

              </button>


            </div>


          </div>

        </div>

      )}

    </>

  );

}


export default DescuentosAdmin;
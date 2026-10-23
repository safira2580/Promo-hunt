import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa6";

import "./Login.css";

function Registro() {

  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [exito, setExito] = useState("");
  const [cargando, setCargando] = useState(false);


  const registrarse = async (e: React.FormEvent) => {

    e.preventDefault();

    setMensaje("");
    setExito("");
    setCargando(true);


    try {

      const respuesta = await fetch(
        "http://localhost:5000/api/registrate",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            nombre: nombre,
            correo: correo,
            contrasena: contrasena,
          }),
        }
      );


      const datos = await respuesta.json();


      if (!respuesta.ok) {

        setMensaje(
          datos.mensaje || "No se pudo crear la cuenta"
        );

        setCargando(false);

        return;
      }


      setExito(
        "Cuenta creada correctamente ✅"
      );


      setNombre("");
      setCorreo("");
      setContrasena("");


      setTimeout(() => {

        navigate("/login");

      }, 1500);


    } catch (error) {

      console.error(
        "Error registrando usuario:",
        error
      );

      setMensaje(
        "No se pudo conectar con el servidor"
      );

    }


    setCargando(false);

  };


  return (

    <section className="login-page">

      <div className="wrapper">

        <form onSubmit={registrarse}>

          <h1>
            Crear cuenta
          </h1>


          {/* NOMBRE */}

          <div className="input-box">

            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              required
            />

            <FaUser />

          </div>


          {/* CORREO */}

          <div className="input-box">

            <input
              type="email"
              placeholder="Correo"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
              required
            />

            <FaEnvelope />

          </div>


          {/* CONTRASEÑA */}

          <div className="input-box">

            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) =>
                setContrasena(e.target.value)
              }
              required
            />

            <FaLock />

          </div>


          {/* MENSAJE ERROR */}

          {mensaje && (

            <div className="error">
              {mensaje}
            </div>

          )}


          {/* MENSAJE ÉXITO */}

          {exito && (

            <div className="success">
              {exito}
            </div>

          )}


          {/* BOTÓN */}

          <button
            type="submit"
            className="btn"
            disabled={cargando}
          >

            {cargando
              ? "Creando cuenta..."
              : "Registrarse"}

          </button>


          {/* VOLVER AL LOGIN */}

          <div className="register-link">

            <p>

              ¿Ya tienes una cuenta?

              {" "}

              <a
                href="#"
                onClick={(e) => {

                  e.preventDefault();

                  navigate("/login");

                }}
              >
                Inicia sesión
              </a>

            </p>

          </div>


        </form>

      </div>

    </section>

  );

}

export default Registro;
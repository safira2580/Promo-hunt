import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHouse,
  FaTags,
  FaGamepad,
  FaHeart,
  FaUser,
  FaBook,
} from "react-icons/fa6";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // No mostrar en login, registro ni admin
  const rutasOcultas = ["/Login", "/registro", "/admin"];
  if (rutasOcultas.some((ruta) => location.pathname.startsWith(ruta))) {
    return null;
  }

  // Recuperar los datos del usuario logueado desde localStorage (o tu estado global)
  // Asegúrate de cambiar "user" por la clave exacta con la que guardas la sesión en tu app
  let userFoto = null;
  try {
    const userData = localStorage.getItem("user") || localStorage.getItem("usuario");
    if (userData) {
      const parsed = JSON.parse(userData);
      // Puede venir como parsed.foto_perfil o parsed.usuario.foto_perfil dependiendo de cómo guardes el login
      const fotoFilename = parsed.foto_perfil || parsed.usuario?.foto_perfil;
      if (fotoFilename) {
        // Ajusta la URL base de tu backend en producción (Railway) o desarrollo (localhost)
        const baseUrl = import.meta.env.VITE_API_URL || "https://lucky-unity-production-fb8a.up.railway.app";
        userFoto = `${baseUrl}/static/img/${fotoFilename}`;
      }
    }
  } catch (e) {
    console.error("Error leyendo la foto del usuario", e);
  }

  const items = [
    {
      path: "/",
      label: "Inicio",
      icon: <FaHouse />,
      match: (p: string) => p === "/",
    },
    {
      path: "/#categorias",
      label: "Categorías",
      icon: <FaTags />,
      match: () => false,
    },
    {
      path: "/#productos",
      label: "Ofertas",
      icon: <FaGamepad />,
      match: () => false,
    },
    {
      path: "/favoritos",
      label: "Favoritos",
      icon: <FaHeart />,
      match: (p: string) => p === "/favoritos",
    },
    {
      path: "/biblioteca",
      label: "Biblioteca",
      icon: <FaBook />,
      match: (p: string) => p === "/biblioteca",
    },
    {
      path: "/Perfil",
      label: "Perfil",
      // Si el usuario tiene foto, usamos una etiqueta img redonda; si no, el icono FaUser
      icon: userFoto ? (
        <img
          src={userFoto}
          alt="Perfil"
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <FaUser />
      ),
      match: (p: string) => p === "/Perfil",
    },
  ];

  const handleClick = (path: string) => {
    if (path.startsWith("/#")) {
      // Navegar a home y hacer scroll a la sección
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const id = path.replace("/#", "");
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const id = path.replace("/#", "");
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {items.map((item) => {
        const isActive = item.match(location.pathname);
        return (
          <button
            key={item.label}
            className={`bottom-nav-item ${isActive ? "active" : ""}`}
            onClick={() => handleClick(item.path)}
            type="button"
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
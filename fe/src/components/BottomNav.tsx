import { useLocation, useNavigate } from "react-router-dom";
import {
  FaHouse,
  FaTags,
  FaUser,
  FaGamepad,
} from "react-icons/fa6";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // No mostrar en login, registro ni admin
  const rutasOcultas = ["/Login", "/registro", "/admin"];
  if (rutasOcultas.some((ruta) => location.pathname.startsWith(ruta))) {
    return null;
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
      path: "/Perfil",
      label: "Perfil",
      icon: <FaUser />,
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

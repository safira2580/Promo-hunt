import { useEffect, useState, type ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { obtenerSesion, type UsuarioSesion } from "../api";

interface Props {
  children: ReactElement;
  /** Si se indica, además de estar autenticado el usuario debe tener este rol. */
  rol?: string;
}

/**
 * Protege una ruta en el cliente: sin sesión -> /Login; sin el rol requerido -> /.
 * (La seguridad real la impone el backend con require_admin; esto evita mostrar
 * pantallas que el usuario no podría usar y mejora la experiencia.)
 */
export default function RutaProtegida({ children, rol }: Props) {
  const [estado, setEstado] = useState<"cargando" | "ok" | "sin-sesion" | "sin-permiso">("cargando");

  useEffect(() => {
    let activo = true;
    obtenerSesion().then((u: UsuarioSesion | null) => {
      if (!activo) return;
      if (!u) setEstado("sin-sesion");
      else if (rol && u.rol !== rol) setEstado("sin-permiso");
      else setEstado("ok");
    });
    return () => {
      activo = false;
    };
  }, [rol]);

  if (estado === "cargando") return <p style={{ padding: "2rem" }}>Verificando sesión…</p>;
  if (estado === "sin-sesion") return <Navigate to="/Login" replace />;
  if (estado === "sin-permiso") return <Navigate to="/" replace />;
  return children;
}

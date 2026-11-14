/**
 * Utilidades compartidas por las pantallas del panel de administrador.
 *
 * - Todas las rutas cuelgan de /api/v1/admin y exigen rol admin (token Bearer).
 * - adminPeticion nunca lanza: devuelve { ok, datos, error } con un mensaje legible.
 */
import { API_URL } from "../../config";
import { authFetch, mensajeDeError } from "../../api";

export const ADMIN = `${API_URL}/api/v1/admin`;

export interface Resultado {
  ok: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  datos: any;
  error: string;
}

export async function adminPeticion(
  ruta: string,
  init: RequestInit = {},
  porDefecto = "Ocurrió un error"
): Promise<Resultado> {
  try {
    const headers = new Headers(init.headers);
    if (init.body) headers.set("Content-Type", "application/json");

    const respuesta = await authFetch(`${ADMIN}${ruta}`, { ...init, headers });
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      let error: string;
      if (respuesta.status === 401) error = "Tu sesión expiró. Inicia sesión de nuevo.";
      else if (respuesta.status === 403) error = "No tienes permisos de administrador.";
      else error = mensajeDeError(datos, porDefecto);
      return { ok: false, datos, error };
    }

    return { ok: true, datos, error: "" };
  } catch (error) {
    console.error("Error en la petición de admin:", error);
    return { ok: false, datos: {}, error: "No se pudo conectar con el servidor." };
  }
}

/** "2026-06-16T07:58:08" -> "2026-06-16" (valor para <input type="date">) */
export const soloFecha = (v: unknown): string => (v ? String(v).slice(0, 10) : "");

/** Fecha legible para tablas; acepta ISO y el formato antiguo "Tue, 16 Jun 2026 ..." */
export function fechaCorta(v: unknown): string {
  if (!v) return "—";
  const texto = String(v);
  if (texto.includes(",")) {
    const fecha = new Date(texto);
    if (!isNaN(fecha.getTime())) return fecha.toLocaleDateString("es-CO");
  }
  return texto.slice(0, 10);
}

/** "" -> null, "3" -> 3 (el backend rechaza "" en columnas numéricas) */
export const aNumero = (v: unknown): number | null =>
  v === "" || v === null || v === undefined ? null : Number(v);

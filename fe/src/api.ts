(import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
/**
 * Cliente HTTP central de PromoHunt.
 *
 * - API_URL vacío (por defecto) => mismo origen: en producción nginx hace proxy de /api,
 *   en desarrollo lo hace el proxy de Vite (vite.config.ts). No hay CORS ni URLs fijas.
 * - Para apuntar a otra API (p. ej. staging) define VITE_API_URL en el build.
 */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
export const API_V1 = `${API_URL}/api/v1`;

const TOKEN_KEY = "promohunt_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* almacenamiento no disponible (modo privado): se ignora */
  }
}

/** fetch + cabecera Authorization si hay sesión. */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

/** Extrae un mensaje legible de errores FastAPI (`detail` string o lista de 422). */
export function mensajeDeError(datos: unknown, porDefecto: string): string {
  const d = (datos as { detail?: unknown; mensaje?: unknown } | null) ?? {};
  if (typeof d.detail === "string") return d.detail;
  if (Array.isArray(d.detail) && d.detail.length > 0) {
    const first = d.detail[0] as { msg?: string; loc?: unknown[] };
    const campo = Array.isArray(first.loc) ? String(first.loc[first.loc.length - 1]) : "";
    return campo ? `${campo}: ${first.msg ?? porDefecto}` : (first.msg ?? porDefecto);
  }
  if (typeof d.mensaje === "string") return d.mensaje;
  return porDefecto;
}

/** fetch con URL completa + cabecera Authorization (para las pantallas que ya arman su URL). */
export function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

export interface UsuarioSesion {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
  foto_perfil?: string | null;
}

/** Consulta /auth/me; devuelve null si no hay sesión válida (y limpia el token vencido). */
export async function obtenerSesion(): Promise<UsuarioSesion | null> {
  if (!getToken()) return null;
  try {
    const r = await apiFetch("/api/v1/auth/me");
    if (!r.ok) {
      if (r.status === 401) setToken(null);
      return null;
    }
    return (await r.json()) as UsuarioSesion;
  } catch {
    return null;
  }
}

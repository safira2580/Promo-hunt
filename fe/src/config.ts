// URL base del backend. En desarrollo usa localhost; en produccion se define
// con la variable VITE_API_URL al construir el frontend (ver README).
const raw = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const API_URL: string = raw.replace(/\/+$/, "");

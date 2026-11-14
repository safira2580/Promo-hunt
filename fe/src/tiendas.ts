// Enlace a la tienda de cada plataforma, buscando el juego por nombre.
// Si la plataforma no tiene buscador conocido, se usa la URL base guardada en la BD.
export function urlTiendaJuego(
  plataforma: string,
  nombreJuego: string,
  urlBase?: string | null,
): string {
  const q = encodeURIComponent(nombreJuego);
  const p = plataforma.toLowerCase();

  if (p.includes("steam")) return `https://store.steampowered.com/search/?term=${q}`;
  if (p.includes("epic")) return `https://store.epicgames.com/es-ES/browse?q=${q}&sortBy=relevancy`;
  if (p.includes("gog")) return `https://www.gog.com/en/games?query=${q}`;
  if (p.includes("microsoft") || p.includes("xbox")) return `https://www.xbox.com/es-CO/search?q=${q}`;
  if (p.includes("playstation")) return `https://store.playstation.com/es-co/search/${q}`;
  if (p.includes("ubisoft")) return `https://store.ubisoft.com/us/search?q=${q}`;
  if (p.includes("ea app") || p === "ea") return `https://www.ea.com/search?q=${q}`;

  return urlBase || "";
}

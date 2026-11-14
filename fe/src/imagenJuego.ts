// Resuelve la imagen de un juego a partir de lo que viene de la base de datos.
// 1) Por nombre del juego (igual que el resto de la app).
// 2) Por el nombre de archivo guardado en la columna `imagen` de la BD.
// 3) Imagen por defecto.
import gta5 from "./assets/img/gta5.jpg";
import f125 from "./assets/img/f125.jpg";
import requiem from "./assets/img/requiem.jpg";
import dytb from "./assets/img/DYTB.jpg";
import mirage from "./assets/img/asc mirage.jpg";
import fc26 from "./assets/img/fc26.jpg";
import spider2 from "./assets/img/spider2.jpg";
import forza6 from "./assets/img/Forza6.jpg";
import defaultImg from "./assets/img/default.jpg";

const porNombre: Record<string, string> = {
  "gta v": gta5,
  "f1 25": f125,
  "resident evil requiem": requiem,
  "dying light the beast": dytb,
  "assassins creed mirage": mirage,
  "ea fc 26": fc26,
  "spiderman 2": spider2,
  "forza horizon 6": forza6,
};

// Todas las imágenes de src/assets/img, indexadas por nombre de archivo en minúsculas.
const archivos = import.meta.glob("./assets/img/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const porArchivo: Record<string, string> = {};
for (const [ruta, url] of Object.entries(archivos)) {
  porArchivo[ruta.split("/").pop()!.toLowerCase()] = url;
}

// "DiRT Rally 2.0" -> "dirt_rally_2_0"; "Civilization VI" -> "civilization_vi"
function slug(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function imagenJuego(nombre?: string | null, imagenBD?: string | null): string {
  const clave = (nombre ?? "").trim().toLowerCase();
  if (porNombre[clave]) return porNombre[clave];

  const archivo = (imagenBD ?? "").trim().toLowerCase();
  if (archivo && porArchivo[archivo]) return porArchivo[archivo];
  if (archivo.startsWith("http")) return imagenBD as string;

  // 3) Por convención: assets/img/<nombre_del_juego>.<ext>
  const base = slug(nombre ?? "");
  if (base) {
    for (const ext of ["jpg", "jpeg", "png", "webp"]) {
      if (porArchivo[`${base}.${ext}`]) return porArchivo[`${base}.${ext}`];
    }
  }

  return defaultImg;
}

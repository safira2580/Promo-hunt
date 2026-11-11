/**
 * Recorrido E2E de PromoHunt + generación de las capturas reales del manual de usuario.
 *
 *   cd scripts/e2e && npm i puppeteer-core
 *   CHROME_PATH=/ruta/a/chrome BASE_URL=http://localhost:5173 node recorrido.mjs
 *
 * Verifica: catálogo, búsqueda, detalle, guardas de ruta (anónimo / usuario / admin),
 * login, registro, perfil, panel admin (6 secciones) y que NO haya errores de consola
 * ni peticiones fallidas inesperadas. Sale con código 1 si algo falla.
 */
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:5173";
const OUT = process.env.OUT_DIR ?? path.resolve("../../docs/manual-usuario/img");
const ADMIN = { correo: process.env.ADMIN_EMAIL ?? "juan@gmail.com", clave: process.env.ADMIN_PASS ?? "123456" };
const USER = { correo: process.env.USER_EMAIL ?? "maria@gmail.com", clave: process.env.USER_PASS ?? "123456" };
fs.mkdirSync(OUT, { recursive: true });

const resultados = [];
const check = (nombre, ok, detalle = "") => {
  resultados.push({ nombre, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${nombre}${detalle ? "  — " + detalle : ""}`);
};
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  headless: "shell",
});

async function nuevaSesion(ancho = 1280, alto = 800) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: ancho, height: alto });
  const errores = [];
  page.on("console", (m) => m.type() === "error" && errores.push(`console: ${m.text()}`));
  page.on("pageerror", (e) => errores.push(`pageerror: ${e.message}`));
  // Las fuentes externas (Google Fonts) dependen de la red del entorno, no de la app
  page.on("requestfailed", (r) => !/fonts\.(googleapis|gstatic)\.com/.test(r.url()) && errores.push(`requestfailed: ${r.url()}`));
  page.on("response", (r) => {
    if (r.status() >= 500) errores.push(`HTTP ${r.status()}: ${r.url()}`);
  });
  return { ctx, page, errores };
}
const shot = (page, nombre, full = false) => page.screenshot({ path: path.join(OUT, nombre), fullPage: full });

async function login(page, { correo, clave }) {
  await page.goto(`${BASE}/Login`, { waitUntil: "networkidle0" });
  await page.type('input[type="email"]', correo);
  await page.type('input[type="password"]', clave);
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}), page.click('button[type="submit"]')]);
}

// ============================ 1) Visitante anónimo ============================
{
  const { ctx, page, errores } = await nuevaSesion();
  await page.goto(BASE, { waitUntil: "networkidle0" });
  await shot(page, "01-inicio.png");
  const tarjetas = await page.$$eval("img", (imgs) => imgs.length);
  check("Inicio carga con imágenes", tarjetas > 3, `${tarjetas} imágenes`);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
  await esperar(500);
  await shot(page, "02-catalogo-ofertas.png");
  const hayJuegos = await page.evaluate(() => /Forza|GTA|Spider|Dying|F1|EA FC|Resident|Assassin/i.test(document.body.innerText));
  check("Catálogo muestra juegos desde la API", hayJuegos);

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.type('input[placeholder="Buscar juegos..."]', "forza");
  await esperar(900); // debounce 300 ms + respuesta
  await shot(page, "03-busqueda.png");
  const resBusq = await page.evaluate(() => /Forza/i.test(document.body.innerText));
  check("Búsqueda con debounce devuelve resultados", resBusq);

  await page.goto(`${BASE}/juego/8`, { waitUntil: "networkidle0" });
  await shot(page, "04-detalle-juego.png", true);
  check("Detalle de juego carga", /Forza/i.test(await page.evaluate(() => document.body.innerText)));

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  check("Guarda: anónimo en /admin es redirigido a /Login", page.url().toLowerCase().endsWith("/login"), page.url());
  await page.goto(`${BASE}/Perfil`, { waitUntil: "networkidle0" });
  check("Guarda: anónimo en /Perfil es redirigido a /Login", page.url().toLowerCase().endsWith("/login"), page.url());

  await page.goto(`${BASE}/Login`, { waitUntil: "networkidle0" });
  await shot(page, "05-login.png");
  await page.type('input[type="email"]', USER.correo);
  await page.type('input[type="password"]', "contraseña-incorrecta");
  await page.click('button[type="submit"]');
  await esperar(1200);
  await shot(page, "06-login-error.png");
  const msgErr = await page.evaluate(() => document.body.innerText);
  check("Login con clave incorrecta muestra mensaje y no entra", /incorrect/i.test(msgErr) && page.url().toLowerCase().endsWith("/login"));

  // Registro (usuario único por ejecución)
  const nuevo = `prueba${Date.now()}@promohunt-demo.com`;
  await page.goto(`${BASE}/registro`, { waitUntil: "networkidle0" });
  await shot(page, "07-registro.png");
  await page.type('input[placeholder="Nombre"]', "Usuario Demo");
  await page.type('input[placeholder="Correo"]', nuevo);
  await page.type('input[placeholder="Contraseña"]', "demo1234");
  await page.click('button[type="submit"]');
  await esperar(1000);
  await shot(page, "08-registro-exitoso.png");
  check("Registro de cuenta nueva", /creada correctamente/i.test(await page.evaluate(() => document.body.innerText)));

  const soloErroresReales = errores.filter((e) => !/401|Failed to load resource/.test(e));
  check("Sin errores JS ni 5xx (visitante)", soloErroresReales.length === 0, soloErroresReales.join(" | "));
  await ctx.close();
}

// ============================ 2) Usuario normal ============================
{
  const { ctx, page, errores } = await nuevaSesion();
  await login(page, USER);
  check("Login de usuario normal redirige a inicio", new URL(page.url()).pathname === "/", page.url());
  await page.goto(`${BASE}/Perfil`, { waitUntil: "networkidle0" });
  await shot(page, "09-perfil.png", true);
  check("Perfil muestra los datos del usuario", /maria/i.test(await page.evaluate(() => document.body.innerText)));
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  check("Guarda: usuario normal en /admin es expulsado a inicio", new URL(page.url()).pathname === "/", page.url());
  const reales = errores.filter((e) => !/403|401|Failed to load resource/.test(e));
  check("Sin errores JS ni 5xx (usuario)", reales.length === 0, reales.join(" | "));
  await ctx.close();
}

// ============================ 3) Administrador ============================
{
  const { ctx, page, errores } = await nuevaSesion(1440, 900);
  await login(page, ADMIN);
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  check("Admin accede a /admin", new URL(page.url()).pathname.toLowerCase() === "/admin", page.url());
  await shot(page, "10-admin-inicio.png");

  const secciones = ["juegos", "descuentos", "desarrolladores", "generos", "categorias", "resenas"];
  const botones = await page.$$(".admin-menu button");
  for (let i = 0; i < secciones.length; i++) {
    const btns = await page.$$(".admin-menu button");
    await btns[i + 1].click(); // índice 0 = inicio
    await page.waitForNetworkIdle({ idleTime: 400, timeout: 8000 }).catch(() => {});
    await shot(page, `${11 + i}-admin-${secciones[i]}.png`);
    const filas = await page.$$eval("table tbody tr", (r) => r.length).catch(() => 0);
    check(`Admin › ${secciones[i]} lista datos de la API`, filas > 0, `${filas} filas`);
  }
  check("Menú admin con 7 entradas", botones.length === 7, `${botones.length}`);

  const reales = errores.filter((e) => !/Failed to load resource/.test(e));
  check("Sin errores JS ni 5xx (admin)", reales.length === 0, reales.join(" | "));
  await ctx.close();
}

// ============================ 4) Móvil ============================
{
  const { ctx, page } = await nuevaSesion(390, 844);
  await page.goto(BASE, { waitUntil: "networkidle0" });
  await shot(page, "17-inicio-movil.png");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  check("Móvil: sin desbordamiento horizontal", !overflow);
  await ctx.close();
}

await browser.close();
const fallos = resultados.filter((r) => !r.ok).length;
console.log(`\n${resultados.length - fallos}/${resultados.length} verificaciones correctas. Capturas en ${OUT}`);
fs.writeFileSync(path.join(OUT, "..", "resultado-e2e.json"), JSON.stringify({ fecha: new Date().toISOString(), base: BASE, resultados }, null, 2));
process.exit(fallos ? 1 : 0);

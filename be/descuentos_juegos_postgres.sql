-- PromoHunt PostgreSQL schema + data
-- Compatible with docker-compose (DB already selected)


CREATE TABLE IF NOT EXISTS categoria (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS genero (
  id_genero SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS desarrollador (
  id_desarrollador SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  pais VARCHAR(100),
  ciudad VARCHAR(100),
  fundacion DATE,
  sitio_web VARCHAR(255),
  logo VARCHAR(255),
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS noticia (
  id_noticia SERIAL PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  contenido TEXT,
  imagen VARCHAR(255),
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plataforma (
  id_plataforma SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  url_tienda VARCHAR(255),
  logo VARCHAR(255),
  descripcion TEXT,
  pais_origen VARCHAR(100),
  fecha_lanzamiento DATE
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(255),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rol VARCHAR(30) NOT NULL
);

CREATE TABLE IF NOT EXISTS juego (
  id_juego SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  fecha_lanzamiento DATE,
  imagen VARCHAR(255),
  portada VARCHAR(255),
  trailer VARCHAR(255),
  edad_minima INTEGER,
  idiomas_disponibles TEXT,
  requisitos_minimos TEXT,
  requisitos_recomendados TEXT,
  modo_juego VARCHAR(100),
  estado VARCHAR(50) DEFAULT 'Disponible',
  id_categoria INTEGER REFERENCES categoria(id_categoria),
  id_genero INTEGER REFERENCES genero(id_genero),
  id_desarrollador INTEGER REFERENCES desarrollador(id_desarrollador),
  id_noticia INTEGER REFERENCES noticia(id_noticia)
);

CREATE TABLE IF NOT EXISTS descuento (
  id_descuento SERIAL PRIMARY KEY,
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego),
  id_plataforma INTEGER NOT NULL REFERENCES plataforma(id_plataforma),
  precio_original DECIMAL(10,2) NOT NULL,
  precio_descuento DECIMAL(10,2) NOT NULL,
  porcentaje_descuento DECIMAL(5,2),
  ahorro DECIMAL(10,2),
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'Activo'
);

CREATE TABLE IF NOT EXISTS alerta (
  id_alerta SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego),
  precio_objetivo DECIMAL(10,2),
  activa BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crossplay (
  id_crossplay SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  steam VARCHAR(50) DEFAULT 'NO',
  epic_games VARCHAR(50) DEFAULT 'NO',
  riot_games VARCHAR(50) DEFAULT 'NO',
  xbox_store VARCHAR(50) DEFAULT 'NO',
  playstation_store VARCHAR(50) DEFAULT 'NO'
);

CREATE TABLE IF NOT EXISTS historial_precios (
  id_historial SERIAL PRIMARY KEY,
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego),
  id_plataforma INTEGER NOT NULL REFERENCES plataforma(id_plataforma),
  precio DECIMAL(10,2) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resena (
  id_resena SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego),
  titulo VARCHAR(150),
  comentario TEXT,
  calificacion INTEGER,
  fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venta (
  id_venta SERIAL PRIMARY KEY,
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego),
  copias_vendidas INTEGER DEFAULT 0,
  ingresos DECIMAL(12,2) DEFAULT 0,
  ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlist (
  id_wishlist SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario),
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego),
  fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DATOS

INSERT INTO categoria (id_categoria, nombre, descripcion, fecha_creacion) VALUES
(1, 'Accion y Aventura', 'Juegos con exploracion y combate', '2026-06-16 07:57:50'),
(2, 'Multijugador', 'Juegos online con varios jugadores', '2026-06-16 07:57:50'),
(3, 'Mundo Abierto', 'Exploracion libre', '2026-06-16 07:57:50'),
(4, 'Supervivencia', 'Recursos y supervivencia', '2026-06-16 07:57:50'),
(5, 'Terror', 'Experiencias de miedo', '2026-06-16 07:57:50'),
(6, 'Carreras', 'Competencias de velocidad', '2026-06-16 07:57:50'),
(7, 'Estrategia', 'Planificacion y tacticas', '2026-06-16 07:57:50'),
(8, 'Deportes', 'Simulacion deportiva', '2026-06-16 07:57:50');

INSERT INTO genero (id_genero, nombre, descripcion, fecha_creacion) VALUES
(1, 'Shooter', 'Disparos en primera o tercera persona', '2026-06-16 07:58:08'),
(2, 'RPG', 'Juego de rol', '2026-06-16 07:58:08'),
(3, 'Battle Royale', 'Supervivencia competitiva', '2026-06-16 07:58:08'),
(4, 'Sandbox', 'Libertad de construccion', '2026-06-16 07:58:08'),
(5, 'MOBA', 'Arena de batalla multijugador', '2026-06-16 07:58:08'),
(6, 'Simulacion', 'Simulacion realista', '2026-06-16 07:58:08'),
(7, 'Aventura', 'Exploracion y narrativa', '2026-06-16 07:58:08'),
(8, 'Plataformas', 'Saltos y desafios', '2026-06-16 07:58:08');

INSERT INTO desarrollador (id_desarrollador, nombre, pais, ciudad, fundacion, sitio_web, logo, descripcion) VALUES
(1, 'Rockstar Games', 'Estados Unidos', 'New York', '1998-12-01', 'https://www.rockstargames.com', 'rockstar.png', 'Creadores de GTA'),
(2, 'Mojang', 'Suecia', 'Estocolmo', '2009-05-01', 'https://www.minecraft.net', 'mojang.png', 'Creadores de Minecraft'),
(3, 'Valve', 'Estados Unidos', 'Bellevue', '1996-08-24', 'https://store.steampowered.com', 'valve.png', 'Propietarios de Steam'),
(4, 'Epic Games', 'Estados Unidos', 'Cary', '1991-01-01', 'https://www.epicgames.com', 'epic.png', 'Creadores de Fortnite'),
(5, 'Riot Games', 'Estados Unidos', 'Los Angeles', '2006-01-01', 'https://www.riotgames.com', 'riot.png', 'League of Legends'),
(6, 'Ubisoft', 'Francia', 'Montreuil', '1986-03-01', 'https://www.ubisoft.com', 'ubisoft.png', 'Assassins Creed'),
(7, 'EA Sports', 'Estados Unidos', 'California', '1982-05-28', 'https://www.ea.com', 'ea.png', 'FC 25'),
(8, 'Playground Games', 'Reino Unido', 'Leamington Spa', '2010-01-01', 'https://www.playground-games.com', 'playground.png', 'Forza Horizon');

INSERT INTO noticia (id_noticia, titulo, contenido, imagen, fecha_publicacion) VALUES
(1, 'GTA VI rompe records', 'Nuevo trailer supera millones de vistas', 'gta6.jpg', '2026-06-16 07:58:22'),
(2, 'Steam Summer Sale', 'Grandes descuentos disponibles', 'steam.jpg', '2026-06-16 07:58:22'),
(3, 'Epic regala juegos', 'Nuevos titulos gratuitos', 'epic.jpg', '2026-06-16 07:58:22'),
(4, 'Minecraft recibe actualizacion', 'Nuevos biomas y criaturas', 'minecraft.jpg', '2026-06-16 07:58:22'),
(5, 'Warzone nueva temporada', 'Nuevo mapa disponible', 'warzone.jpg', '2026-06-16 07:58:22'),
(6, 'FC 26 anunciado', 'EA Sports presenta novedades', 'fc26.jpg', '2026-06-16 07:58:22'),
(7, 'Forza Horizon evento', 'Carreras especiales del mes', 'forza.jpg', '2026-06-16 07:58:22'),
(8, 'League of Legends Worlds', 'Comienza el mundial', 'lol.jpg', '2026-06-16 07:58:22');

INSERT INTO plataforma (id_plataforma, nombre, url_tienda, logo, descripcion, pais_origen, fecha_lanzamiento) VALUES
(1, 'Steam', 'https://store.steampowered.com', 'steam.png', 'Tienda de Valve', 'Estados Unidos', '2003-09-12'),
(2, 'Epic Games', 'https://www.epicgames.com', 'epic.png', 'Tienda de Epic', 'Estados Unidos', '2018-12-06'),
(3, 'Prime Gaming', 'https://gaming.amazon.com', 'prime.png', 'Beneficios Amazon', 'Estados Unidos', '2020-08-10'),
(4, 'GOG', 'https://www.gog.com', 'gog.png', 'Sin DRM', 'Polonia', '2008-09-26'),
(5, 'Battle.net', 'https://battle.net', 'battle.png', 'Blizzard', 'Estados Unidos', '1996-12-31'),
(6, 'Ubisoft Connect', 'https://ubisoftconnect.com', 'ubi.png', 'Ubisoft', 'Francia', '2009-01-01'),
(7, 'EA App', 'https://ea.com', 'eaapp.png', 'Electronic Arts', 'Estados Unidos', '2011-06-03'),
(8, 'Microsoft Store', 'https://www.microsoft.com/store', 'microsoft.png', 'Tienda Microsoft', 'Estados Unidos', '2012-10-26');

INSERT INTO usuario (id_usuario, nombre, correo, contrasena, foto_perfil, fecha_registro, rol) VALUES
(1, 'Juan Perez', 'juan@gmail.com', '123456', 'juan.jpg', '2026-06-16 07:58:52', 'admin'),
(2, 'Maria Lopez', 'maria@gmail.com', '123456', 'maria.jpg', '2026-06-16 07:58:52', 'user'),
(3, 'Carlos Ruiz', 'carlos@gmail.com', '123456', 'carlos.jpg', '2026-06-16 07:58:52', 'user'),
(4, 'Anas Torres', 'ana@gmail.com', '1234567', 'ana.jpg', '2026-06-16 07:58:52', 'user'),
(5, 'Luis Gomez', 'luis@gmail.com', '123456', 'luis.jpg', '2026-06-16 07:58:52', 'user'),
(6, 'Sofia Diaz', 'sofia@gmail.com', '123456', 'sofia.jpg', '2026-06-16 07:58:52', 'user'),
(7, 'Pedro Silva', 'pedro@gmail.com', '123456', 'pedro.jpg', '2026-06-16 07:58:52', 'user'),
(8, 'Laura Castro', 'laura@gmail.com', '123456', 'laura.jpg', '2026-06-16 07:58:52', 'user'),
(9, 'Sebastian Aguilar', 'juanysaurio@gmail.com', 'sapohpta', NULL, '2026-06-16 11:42:25', 'user'),
(10, 'earatstyrh', 'sadsad@asdasda', '1234567', NULL, '2026-06-16 11:42:42', 'user'),
(11, 'oscar', 'puto@gmail.com', 'puto', NULL, '2026-06-16 12:20:36', 'user'),
(12, 'casallas', 'puto2@gmail.com', 'puto3', NULL, '2026-06-16 12:23:16', 'user'),
(13, 'hyjhjhfljkf kgfikl gkl', 'hgfkhgf@xn--hlhylh-0wa', '1234', NULL, '2026-07-27 20:17:39', 'user'),
(14, 'sebs', 'juanysaurio2@gmail.com', '1234', NULL, '2026-09-07 01:22:33', 'user');

INSERT INTO juego (id_juego, nombre, descripcion, fecha_lanzamiento, imagen, portada, trailer, edad_minima, idiomas_disponibles, requisitos_minimos, requisitos_recomendados, modo_juego, estado, id_categoria, id_genero, id_desarrollador, id_noticia) VALUES
(1, 'GTA V', 'Mundo abierto criminal', '2026-09-01', 'gta5.jpg', 'gta5_portada.jpg', 'gta5.mp4', 19, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 3, 2, 1, 1),
(2, 'F1 25', 'Carreras y simulacion', '2011-11-18', 'minecraft.jpg', 'minecraft_portada.jpg', 'minecraft.mp4', 7, 'ES,EN', '4GB RAM', '8GB RAM', 'Online', 'Disponible', 2, 6, 7, 3),
(3, 'Spiderman 2', 'accion y aventura', '2023-09-27', 'spider2.jpg', 'spider2_portada.jpg', 'spider2.mp4', 16, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 2, 1, 3, 2),
(4, 'resident evil requiem', 'Suspenso', '2017-07-21', 'requiem.jpg', 'requiem_portada.jpg', 'requiem.mp4', 12, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 1, 7, 6, 3),
(5, 'Dying Light The Beast', 'mundo abierto ', '2009-10-27', 'lol.jpg', 'lol_portada.jpg', 'lol.mp4', 12, 'ES,EN', '4GB RAM', '16GB RAM', 'Online', 'Disponible', 3, 7, 6, 2),
(6, 'Assassins Creed Mirage', 'Aventura historica', '2023-10-05', 'acm.jpg', 'acm_portada.jpg', 'acm.mp4', 18, 'ES,EN', '8GB RAM', '16GB RAM', 'Historia', 'Disponible', 1, 7, 6, 2),
(7, 'EA FC 26', 'Futbol', '2024-09-20', 'fc25.jpg', 'fc25_portada.jpg', 'fc25.mp4', 3, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 8, 6, 7, 6),
(8, 'Forza Horizon 6', 'Carreras mundo abierto', '2021-11-09', 'forza.jpg', 'forza_portada.jpg', 'forza.mp4', 3, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 6, 6, 8, 7);

INSERT INTO descuento (id_descuento, id_juego, id_plataforma, precio_original, precio_descuento, porcentaje_descuento, ahorro, fecha_inicio, fecha_fin, estado) VALUES
(1, 1, 1, 60.00, 20.00, 67.00, 40.00, NULL, NULL, 'Activo'),
(2, 2, 1, 30.00, 15.00, 50.00, 15.00, NULL, NULL, 'Activo'),
(3, 3, 1, 15.00, 10.00, 33.00, 5.00, NULL, NULL, 'Activo'),
(4, 4, 2, 20.00, 0.00, 100.00, 20.00, NULL, NULL, 'Activo'),
(5, 5, 1, 10.00, 5.00, 50.00, 5.00, NULL, NULL, 'Activo'),
(6, 6, 6, 50.00, 30.00, 40.00, 20.00, NULL, NULL, 'Activo'),
(7, 7, 7, 70.00, 50.00, 29.00, 20.00, NULL, NULL, 'Activo'),
(8, 8, 8, 60.00, 40.00, 33.00, 20.00, NULL, NULL, 'Activo');

INSERT INTO alerta (id_alerta, id_usuario, id_juego, precio_objetivo, activa, fecha_creacion) VALUES
(1, 1, 1, 15.00, TRUE, '2026-06-16 08:00:15'),
(2, 2, 2, 10.00, TRUE, '2026-06-16 08:00:15'),
(3, 3, 3, 8.00, TRUE, '2026-06-16 08:00:15'),
(4, 4, 4, 5.00, TRUE, '2026-06-16 08:00:15'),
(5, 5, 5, 4.00, TRUE, '2026-06-16 08:00:15'),
(6, 6, 6, 25.00, TRUE, '2026-06-16 08:00:15'),
(7, 7, 7, 40.00, TRUE, '2026-06-16 08:00:15'),
(8, 8, 8, 35.00, TRUE, '2026-06-16 08:00:15');

INSERT INTO crossplay (id_crossplay, id_usuario, steam, epic_games, riot_games, xbox_store, playstation_store) VALUES
(1, 2, 'SI', 'SI', 'SI', 'SI', 'SI'),
(2, 3, 'SI', 'SI', 'SI', 'SI', 'SI'),
(3, 4, 'SI', 'SI', 'SI', 'SI', 'SI'),
(4, 5, 'SI', 'SI', 'SI', 'SI', 'SI'),
(5, 6, 'SI', 'SI', 'SI', 'SI', 'SI'),
(6, 7, 'SI', 'SI', 'SI', 'SI', 'NO'),
(7, 8, 'SI', 'SI', 'SI', 'NO', 'NO'),
(8, 9, 'SI', 'SI', 'SI', 'NO', 'NO'),
(9, 10, 'SI', 'SI', 'SI', 'NO', 'NO'),
(10, 11, 'SI', 'SI', 'SI', 'NO', 'NO'),
(11, 12, 'SI', 'SI', 'SI', 'NO', 'NO');

INSERT INTO historial_precios (id_historial, id_juego, id_plataforma, precio, fecha_registro) VALUES
(1, 1, 1, 60.00, '2026-06-16 07:59:47'),
(2, 2, 1, 30.00, '2026-06-16 07:59:47'),
(3, 3, 1, 15.00, '2026-06-16 07:59:47'),
(4, 4, 2, 20.00, '2026-06-16 07:59:47'),
(5, 5, 1, 10.00, '2026-06-16 07:59:47'),
(6, 6, 6, 50.00, '2026-06-16 07:59:47'),
(7, 7, 7, 70.00, '2026-06-16 07:59:47'),
(8, 8, 8, 60.00, '2026-06-16 07:59:47');

INSERT INTO resena (id_resena, id_usuario, id_juego, titulo, comentario, calificacion, fecha_publicacion) VALUES
(1, 1, 1, 'Excelente', 'Uno de los mejores juegos', 5, '2026-06-16 08:00:25'),
(2, 2, 2, 'Muy bueno', 'Creativo y divertido', 5, '2026-06-16 08:00:25'),
(3, 3, 3, 'Competitivo', 'Gran shooter', 4, '2026-06-16 08:00:25'),
(4, 4, 4, 'Entretenido', 'Buen battle royale', 4, '2026-06-16 08:00:25'),
(5, 5, 5, 'Clasico', 'Muy adictivo', 5, '2026-06-16 08:00:25'),
(6, 6, 6, 'Historia buena', 'Buen regreso de Ubisoft', 4, '2026-06-16 08:00:25'),
(7, 7, 7, 'Buen futbol', 'Mejor que versiones anteriores', 4, '2026-06-16 08:00:25'),
(8, 8, 8, 'Increible', 'Las carreras son espectaculares', 5, '2026-06-16 08:00:25');

INSERT INTO venta (id_venta, id_juego, copias_vendidas, ingresos, ultima_actualizacion) VALUES
(1, 1, 195000000, 3900000000.00, '2026-06-16 08:30:03'),
(2, 2, 300000000, 4500000000.00, '2026-06-16 08:30:03'),
(3, 3, 55000000, 550000000.00, '2026-06-16 08:30:03'),
(4, 4, 120000000, 1200000000.00, '2026-06-16 08:30:03'),
(5, 5, 180000000, 900000000.00, '2026-06-16 08:30:03'),
(6, 6, 15000000, 450000000.00, '2026-06-16 08:30:03'),
(7, 7, 35000000, 1750000000.00, '2026-06-16 08:30:03'),
(8, 8, 42000000, 1680000000.00, '2026-06-16 08:30:03');

INSERT INTO wishlist (id_wishlist, id_usuario, id_juego, fecha_agregado) VALUES
(1, 1, 1, '2026-06-16 08:00:01'),
(2, 2, 2, '2026-06-16 08:00:01'),
(3, 3, 3, '2026-06-16 08:00:01'),
(4, 4, 4, '2026-06-16 08:00:01'),
(5, 5, 5, '2026-06-16 08:00:01'),
(6, 6, 6, '2026-06-16 08:00:01'),
(7, 7, 7, '2026-06-16 08:00:01'),
(8, 8, 8, '2026-06-16 08:00:01');

SELECT setval(pg_get_serial_sequence('categoria', 'id_categoria'), COALESCE((SELECT MAX(id_categoria) FROM categoria), 1));
SELECT setval(pg_get_serial_sequence('genero', 'id_genero'), COALESCE((SELECT MAX(id_genero) FROM genero), 1));
SELECT setval(pg_get_serial_sequence('desarrollador', 'id_desarrollador'), COALESCE((SELECT MAX(id_desarrollador) FROM desarrollador), 1));
SELECT setval(pg_get_serial_sequence('noticia', 'id_noticia'), COALESCE((SELECT MAX(id_noticia) FROM noticia), 1));
SELECT setval(pg_get_serial_sequence('plataforma', 'id_plataforma'), COALESCE((SELECT MAX(id_plataforma) FROM plataforma), 1));
SELECT setval(pg_get_serial_sequence('usuario', 'id_usuario'), COALESCE((SELECT MAX(id_usuario) FROM usuario), 1));
SELECT setval(pg_get_serial_sequence('juego', 'id_juego'), COALESCE((SELECT MAX(id_juego) FROM juego), 1));
SELECT setval(pg_get_serial_sequence('descuento', 'id_descuento'), COALESCE((SELECT MAX(id_descuento) FROM descuento), 1));
SELECT setval(pg_get_serial_sequence('alerta', 'id_alerta'), COALESCE((SELECT MAX(id_alerta) FROM alerta), 1));
SELECT setval(pg_get_serial_sequence('crossplay', 'id_crossplay'), COALESCE((SELECT MAX(id_crossplay) FROM crossplay), 1));
SELECT setval(pg_get_serial_sequence('historial_precios', 'id_historial'), COALESCE((SELECT MAX(id_historial) FROM historial_precios), 1));
SELECT setval(pg_get_serial_sequence('resena', 'id_resena'), COALESCE((SELECT MAX(id_resena) FROM resena), 1));
SELECT setval(pg_get_serial_sequence('venta', 'id_venta'), COALESCE((SELECT MAX(id_venta) FROM venta), 1));
SELECT setval(pg_get_serial_sequence('wishlist', 'id_wishlist'), COALESCE((SELECT MAX(id_wishlist) FROM wishlist), 1));

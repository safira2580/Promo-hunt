-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-09-2026 a las 08:29:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `descuentos_juegos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `alerta`
--

CREATE TABLE `alerta` (
  `id_alerta` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_juego` int(11) NOT NULL,
  `precio_objetivo` decimal(10,2) DEFAULT NULL,
  `activa` tinyint(1) DEFAULT 1,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `alerta`
--

INSERT INTO `alerta` (`id_alerta`, `id_usuario`, `id_juego`, `precio_objetivo`, `activa`, `fecha_creacion`) VALUES
(1, 1, 1, 15.00, 1, '2026-06-16 08:00:15'),
(2, 2, 2, 10.00, 1, '2026-06-16 08:00:15'),
(3, 3, 3, 8.00, 1, '2026-06-16 08:00:15'),
(4, 4, 4, 5.00, 1, '2026-06-16 08:00:15'),
(5, 5, 5, 4.00, 1, '2026-06-16 08:00:15'),
(6, 6, 6, 25.00, 1, '2026-06-16 08:00:15'),
(7, 7, 7, 40.00, 1, '2026-06-16 08:00:15'),
(8, 8, 8, 35.00, 1, '2026-06-16 08:00:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `nombre`, `descripcion`, `fecha_creacion`) VALUES
(1, 'Accion y Aventura', 'Juegos con exploracion y combate', '2026-06-16 07:57:50'),
(2, 'Multijugador', 'Juegos online con varios jugadores', '2026-06-16 07:57:50'),
(3, 'Mundo Abierto', 'Exploracion libre', '2026-06-16 07:57:50'),
(4, 'Supervivencia', 'Recursos y supervivencia', '2026-06-16 07:57:50'),
(5, 'Terror', 'Experiencias de miedo', '2026-06-16 07:57:50'),
(6, 'Carreras', 'Competencias de velocidad', '2026-06-16 07:57:50'),
(7, 'Estrategia', 'Planificacion y tacticas', '2026-06-16 07:57:50'),
(8, 'Deportes', 'Simulacion deportiva', '2026-06-16 07:57:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `crossplay`
--

CREATE TABLE `crossplay` (
  `id_crossplay` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `steam` enum('SI','NO') DEFAULT 'NO',
  `epic_games` enum('SI','NO') DEFAULT 'NO',
  `riot_games` enum('SI','NO') DEFAULT 'NO',
  `xbox_store` enum('SI','NO') DEFAULT 'NO',
  `playstation_store` enum('SI','NO') DEFAULT 'NO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `crossplay`
--

INSERT INTO `crossplay` (`id_crossplay`, `id_usuario`, `steam`, `epic_games`, `riot_games`, `xbox_store`, `playstation_store`) VALUES
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `desarrollador`
--

CREATE TABLE `desarrollador` (
  `id_desarrollador` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `fundacion` date DEFAULT NULL,
  `sitio_web` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `desarrollador`
--

INSERT INTO `desarrollador` (`id_desarrollador`, `nombre`, `pais`, `ciudad`, `fundacion`, `sitio_web`, `logo`, `descripcion`) VALUES
(1, 'Rockstar Games', 'Estados Unidos', 'New York', '1998-12-01', 'https://www.rockstargames.com', 'rockstar.png', 'Creadores de GTA'),
(2, 'Mojang', 'Suecia', 'Estocolmo', '2009-05-01', 'https://www.minecraft.net', 'mojang.png', 'Creadores de Minecraft'),
(3, 'Valve', 'Estados Unidos', 'Bellevue', '1996-08-24', 'https://store.steampowered.com', 'valve.png', 'Propietarios de Steam'),
(4, 'Epic Games', 'Estados Unidos', 'Cary', '1991-01-01', 'https://www.epicgames.com', 'epic.png', 'Creadores de Fortnite'),
(5, 'Riot Games', 'Estados Unidos', 'Los Angeles', '2006-01-01', 'https://www.riotgames.com', 'riot.png', 'League of Legends'),
(6, 'Ubisoft', 'Francia', 'Montreuil', '1986-03-01', 'https://www.ubisoft.com', 'ubisoft.png', 'Assassins Creed'),
(7, 'EA Sports', 'Estados Unidos', 'California', '1982-05-28', 'https://www.ea.com', 'ea.png', 'FC 25'),
(8, 'Playground Games', 'Reino Unido', 'Leamington Spa', '2010-01-01', 'https://www.playground-games.com', 'playground.png', 'Forza Horizon');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `descuento`
--

CREATE TABLE `descuento` (
  `id_descuento` int(11) NOT NULL,
  `id_juego` int(11) NOT NULL,
  `id_plataforma` int(11) NOT NULL,
  `precio_original` decimal(10,2) NOT NULL,
  `precio_descuento` decimal(10,2) NOT NULL,
  `porcentaje_descuento` decimal(5,2) DEFAULT NULL,
  `ahorro` decimal(10,2) DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `estado` enum('Activo','Finalizado','Programado') DEFAULT 'Activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `descuento`
--

INSERT INTO `descuento` (`id_descuento`, `id_juego`, `id_plataforma`, `precio_original`, `precio_descuento`, `porcentaje_descuento`, `ahorro`, `fecha_inicio`, `fecha_fin`, `estado`) VALUES
(1, 1, 1, 60.00, 20.00, 67.00, 40.00, NULL, NULL, 'Activo'),
(2, 2, 1, 30.00, 15.00, 50.00, 15.00, NULL, NULL, 'Activo'),
(3, 3, 1, 15.00, 10.00, 33.00, 5.00, NULL, NULL, 'Activo'),
(4, 4, 2, 20.00, 0.00, 100.00, 20.00, NULL, NULL, 'Activo'),
(5, 5, 1, 10.00, 5.00, 50.00, 5.00, NULL, NULL, 'Activo'),
(6, 6, 6, 50.00, 30.00, 40.00, 20.00, NULL, NULL, 'Activo'),
(7, 7, 7, 70.00, 50.00, 29.00, 20.00, NULL, NULL, 'Activo'),
(8, 8, 8, 60.00, 40.00, 33.00, 20.00, NULL, NULL, 'Activo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genero`
--

CREATE TABLE `genero` (
  `id_genero` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `genero`
--

INSERT INTO `genero` (`id_genero`, `nombre`, `descripcion`, `fecha_creacion`) VALUES
(1, 'Shooter', 'Disparos en primera o tercera persona', '2026-06-16 07:58:08'),
(2, 'RPG', 'Juego de rol', '2026-06-16 07:58:08'),
(3, 'Battle Royale', 'Supervivencia competitiva', '2026-06-16 07:58:08'),
(4, 'Sandbox', 'Libertad de construccion', '2026-06-16 07:58:08'),
(5, 'MOBA', 'Arena de batalla multijugador', '2026-06-16 07:58:08'),
(6, 'Simulacion', 'Simulacion realista', '2026-06-16 07:58:08'),
(7, 'Aventura', 'Exploracion y narrativa', '2026-06-16 07:58:08'),
(8, 'Plataformas', 'Saltos y desafios', '2026-06-16 07:58:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_precios`
--

CREATE TABLE `historial_precios` (
  `id_historial` int(11) NOT NULL,
  `id_juego` int(11) NOT NULL,
  `id_plataforma` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_precios`
--

INSERT INTO `historial_precios` (`id_historial`, `id_juego`, `id_plataforma`, `precio`, `fecha_registro`) VALUES
(1, 1, 1, 60.00, '2026-06-16 07:59:47'),
(2, 2, 1, 30.00, '2026-06-16 07:59:47'),
(3, 3, 1, 15.00, '2026-06-16 07:59:47'),
(4, 4, 2, 20.00, '2026-06-16 07:59:47'),
(5, 5, 1, 10.00, '2026-06-16 07:59:47'),
(6, 6, 6, 50.00, '2026-06-16 07:59:47'),
(7, 7, 7, 70.00, '2026-06-16 07:59:47'),
(8, 8, 8, 60.00, '2026-06-16 07:59:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `juego`
--

CREATE TABLE `juego` (
  `id_juego` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_lanzamiento` date DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `portada` varchar(255) DEFAULT NULL,
  `trailer` varchar(255) DEFAULT NULL,
  `edad_minima` int(11) DEFAULT NULL,
  `idiomas_disponibles` text DEFAULT NULL,
  `requisitos_minimos` text DEFAULT NULL,
  `requisitos_recomendados` text DEFAULT NULL,
  `modo_juego` varchar(100) DEFAULT NULL,
  `estado` enum('Disponible','Proximamente','Descontinuado') DEFAULT 'Disponible',
  `id_categoria` int(11) DEFAULT NULL,
  `id_genero` int(11) DEFAULT NULL,
  `id_desarrollador` int(11) DEFAULT NULL,
  `id_noticia` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `juego`
--

INSERT INTO `juego` (`id_juego`, `nombre`, `descripcion`, `fecha_lanzamiento`, `imagen`, `portada`, `trailer`, `edad_minima`, `idiomas_disponibles`, `requisitos_minimos`, `requisitos_recomendados`, `modo_juego`, `estado`, `id_categoria`, `id_genero`, `id_desarrollador`, `id_noticia`) VALUES
(1, 'GTA V', 'Mundo abierto criminal', '2026-09-01', 'gta5.jpg', 'gta5_portada.jpg', 'gta5.mp4', 19, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 3, 2, 1, 1),
(2, 'F1 25', 'Carreras y simulacion', '2011-11-18', 'minecraft.jpg', 'minecraft_portada.jpg', 'minecraft.mp4', 7, 'ES,EN', '4GB RAM', '8GB RAM', 'Online', 'Disponible', 2, 6, 7, 3),
(3, 'Spiderman 2', 'accion y aventura', '2023-09-27', 'spider2.jpg', 'spider2_portada.jpg', 'spider2.mp4', 16, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 2, 1, 3, 2),
(4, 'resident evil requiem', 'Suspenso', '2017-07-21', 'requiem.jpg', 'requiem_portada.jpg', 'requiem.mp4', 12, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 1, 7, 6, 3),
(5, 'Dying Light The Beast', 'mundo abierto ', '2009-10-27', 'lol.jpg', 'lol_portada.jpg', 'lol.mp4', 12, 'ES,EN', '4GB RAM', '16GB RAM', 'Online', 'Disponible', 3, 7, 6, 2),
(6, 'Assassins Creed Mirage', 'Aventura historica', '2023-10-05', 'acm.jpg', 'acm_portada.jpg', 'acm.mp4', 18, 'ES,EN', '8GB RAM', '16GB RAM', 'Historia', 'Disponible', 1, 7, 6, 2),
(7, 'EA FC 26', 'Futbol', '2024-09-20', 'fc25.jpg', 'fc25_portada.jpg', 'fc25.mp4', 3, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 8, 6, 7, 6),
(8, 'Forza Horizon 6', 'Carreras mundo abierto', '2021-11-09', 'forza.jpg', 'forza_portada.jpg', 'forza.mp4', 3, 'ES,EN', '8GB RAM', '16GB RAM', 'Online', 'Disponible', 6, 6, 8, 7);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `noticia`
--

CREATE TABLE `noticia` (
  `id_noticia` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `contenido` text DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `fecha_publicacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `noticia`
--

INSERT INTO `noticia` (`id_noticia`, `titulo`, `contenido`, `imagen`, `fecha_publicacion`) VALUES
(1, 'GTA VI rompe records', 'Nuevo trailer supera millones de vistas', 'gta6.jpg', '2026-06-16 07:58:22'),
(2, 'Steam Summer Sale', 'Grandes descuentos disponibles', 'steam.jpg', '2026-06-16 07:58:22'),
(3, 'Epic regala juegos', 'Nuevos titulos gratuitos', 'epic.jpg', '2026-06-16 07:58:22'),
(4, 'Minecraft recibe actualizacion', 'Nuevos biomas y criaturas', 'minecraft.jpg', '2026-06-16 07:58:22'),
(5, 'Warzone nueva temporada', 'Nuevo mapa disponible', 'warzone.jpg', '2026-06-16 07:58:22'),
(6, 'FC 26 anunciado', 'EA Sports presenta novedades', 'fc26.jpg', '2026-06-16 07:58:22'),
(7, 'Forza Horizon evento', 'Carreras especiales del mes', 'forza.jpg', '2026-06-16 07:58:22'),
(8, 'League of Legends Worlds', 'Comienza el mundial', 'lol.jpg', '2026-06-16 07:58:22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plataforma`
--

CREATE TABLE `plataforma` (
  `id_plataforma` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `url_tienda` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `pais_origen` varchar(100) DEFAULT NULL,
  `fecha_lanzamiento` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `plataforma`
--

INSERT INTO `plataforma` (`id_plataforma`, `nombre`, `url_tienda`, `logo`, `descripcion`, `pais_origen`, `fecha_lanzamiento`) VALUES
(1, 'Steam', 'https://store.steampowered.com', 'steam.png', 'Tienda de Valve', 'Estados Unidos', '2003-09-12'),
(2, 'Epic Games', 'https://www.epicgames.com', 'epic.png', 'Tienda de Epic', 'Estados Unidos', '2018-12-06'),
(3, 'Prime Gaming', 'https://gaming.amazon.com', 'prime.png', 'Beneficios Amazon', 'Estados Unidos', '2020-08-10'),
(4, 'GOG', 'https://www.gog.com', 'gog.png', 'Sin DRM', 'Polonia', '2008-09-26'),
(5, 'Battle.net', 'https://battle.net', 'battle.png', 'Blizzard', 'Estados Unidos', '1996-12-31'),
(6, 'Ubisoft Connect', 'https://ubisoftconnect.com', 'ubi.png', 'Ubisoft', 'Francia', '2009-01-01'),
(7, 'EA App', 'https://ea.com', 'eaapp.png', 'Electronic Arts', 'Estados Unidos', '2011-06-03'),
(8, 'Microsoft Store', 'https://www.microsoft.com/store', 'microsoft.png', 'Tienda Microsoft', 'Estados Unidos', '2012-10-26');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resena`
--

CREATE TABLE `resena` (
  `id_resena` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_juego` int(11) NOT NULL,
  `titulo` varchar(150) DEFAULT NULL,
  `comentario` text DEFAULT NULL,
  `calificacion` int(11) DEFAULT NULL CHECK (`calificacion` between 1 and 5),
  `fecha_publicacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resena`
--

INSERT INTO `resena` (`id_resena`, `id_usuario`, `id_juego`, `titulo`, `comentario`, `calificacion`, `fecha_publicacion`) VALUES
(1, 1, 1, 'Excelente', 'Uno de los mejores juegos', 5, '2026-06-16 08:00:25'),
(2, 2, 2, 'Muy bueno', 'Creativo y divertido', 5, '2026-06-16 08:00:25'),
(3, 3, 3, 'Competitivo', 'Gran shooter', 4, '2026-06-16 08:00:25'),
(4, 4, 4, 'Entretenido', 'Buen battle royale', 4, '2026-06-16 08:00:25'),
(5, 5, 5, 'Clasico', 'Muy adictivo', 5, '2026-06-16 08:00:25'),
(6, 6, 6, 'Historia buena', 'Buen regreso de Ubisoft', 4, '2026-06-16 08:00:25'),
(7, 7, 7, 'Buen futbol', 'Mejor que versiones anteriores', 4, '2026-06-16 08:00:25'),
(8, 8, 8, 'Increible', 'Las carreras son espectaculares', 5, '2026-06-16 08:00:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `rol` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `correo`, `contrasena`, `foto_perfil`, `fecha_registro`, `rol`) VALUES
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

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `usuarios_cross`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `usuarios_cross` (
`nombre` varchar(100)
,`correo` varchar(100)
,`steam` enum('SI','NO')
,`riot_games` enum('SI','NO')
,`epic_games` enum('SI','NO')
,`xbox_store` enum('SI','NO')
,`playstation_store` enum('SI','NO')
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `venta`
--

CREATE TABLE `venta` (
  `id_venta` int(11) NOT NULL,
  `id_juego` int(11) NOT NULL,
  `copias_vendidas` int(11) DEFAULT 0,
  `ingresos` decimal(12,2) DEFAULT 0.00,
  `ultima_actualizacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `venta`
--

INSERT INTO `venta` (`id_venta`, `id_juego`, `copias_vendidas`, `ingresos`, `ultima_actualizacion`) VALUES
(1, 1, 195000000, 3900000000.00, '2026-06-16 08:30:03'),
(2, 2, 300000000, 4500000000.00, '2026-06-16 08:30:03'),
(3, 3, 55000000, 550000000.00, '2026-06-16 08:30:03'),
(4, 4, 120000000, 1200000000.00, '2026-06-16 08:30:03'),
(5, 5, 180000000, 900000000.00, '2026-06-16 08:30:03'),
(6, 6, 15000000, 450000000.00, '2026-06-16 08:30:03'),
(7, 7, 35000000, 1750000000.00, '2026-06-16 08:30:03'),
(8, 8, 42000000, 1680000000.00, '2026-06-16 08:30:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `wishlist`
--

CREATE TABLE `wishlist` (
  `id_wishlist` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_juego` int(11) NOT NULL,
  `fecha_agregado` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `wishlist`
--

INSERT INTO `wishlist` (`id_wishlist`, `id_usuario`, `id_juego`, `fecha_agregado`) VALUES
(1, 1, 1, '2026-06-16 08:00:01'),
(2, 2, 2, '2026-06-16 08:00:01'),
(3, 3, 3, '2026-06-16 08:00:01'),
(4, 4, 4, '2026-06-16 08:00:01'),
(5, 5, 5, '2026-06-16 08:00:01'),
(6, 6, 6, '2026-06-16 08:00:01'),
(7, 7, 7, '2026-06-16 08:00:01'),
(8, 8, 8, '2026-06-16 08:00:01');

-- --------------------------------------------------------

--
-- Estructura para la vista `usuarios_cross`
--
DROP TABLE IF EXISTS `usuarios_cross`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `usuarios_cross`  AS SELECT `u`.`nombre` AS `nombre`, `u`.`correo` AS `correo`, `c`.`steam` AS `steam`, `c`.`riot_games` AS `riot_games`, `c`.`epic_games` AS `epic_games`, `c`.`xbox_store` AS `xbox_store`, `c`.`playstation_store` AS `playstation_store` FROM (`usuario` `u` join `crossplay` `c` on(`u`.`id_usuario` = `c`.`id_usuario`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `alerta`
--
ALTER TABLE `alerta`
  ADD PRIMARY KEY (`id_alerta`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_juego` (`id_juego`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `crossplay`
--
ALTER TABLE `crossplay`
  ADD PRIMARY KEY (`id_crossplay`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `desarrollador`
--
ALTER TABLE `desarrollador`
  ADD PRIMARY KEY (`id_desarrollador`);

--
-- Indices de la tabla `descuento`
--
ALTER TABLE `descuento`
  ADD PRIMARY KEY (`id_descuento`),
  ADD KEY `id_juego` (`id_juego`),
  ADD KEY `id_plataforma` (`id_plataforma`);

--
-- Indices de la tabla `genero`
--
ALTER TABLE `genero`
  ADD PRIMARY KEY (`id_genero`);

--
-- Indices de la tabla `historial_precios`
--
ALTER TABLE `historial_precios`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_juego` (`id_juego`),
  ADD KEY `id_plataforma` (`id_plataforma`);

--
-- Indices de la tabla `juego`
--
ALTER TABLE `juego`
  ADD PRIMARY KEY (`id_juego`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `id_genero` (`id_genero`),
  ADD KEY `id_desarrollador` (`id_desarrollador`),
  ADD KEY `id_noticia` (`id_noticia`);

--
-- Indices de la tabla `noticia`
--
ALTER TABLE `noticia`
  ADD PRIMARY KEY (`id_noticia`);

--
-- Indices de la tabla `plataforma`
--
ALTER TABLE `plataforma`
  ADD PRIMARY KEY (`id_plataforma`);

--
-- Indices de la tabla `resena`
--
ALTER TABLE `resena`
  ADD PRIMARY KEY (`id_resena`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_juego` (`id_juego`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `venta`
--
ALTER TABLE `venta`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `id_juego` (`id_juego`);

--
-- Indices de la tabla `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id_wishlist`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_juego` (`id_juego`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `alerta`
--
ALTER TABLE `alerta`
  MODIFY `id_alerta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `crossplay`
--
ALTER TABLE `crossplay`
  MODIFY `id_crossplay` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `desarrollador`
--
ALTER TABLE `desarrollador`
  MODIFY `id_desarrollador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `descuento`
--
ALTER TABLE `descuento`
  MODIFY `id_descuento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `genero`
--
ALTER TABLE `genero`
  MODIFY `id_genero` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `historial_precios`
--
ALTER TABLE `historial_precios`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `juego`
--
ALTER TABLE `juego`
  MODIFY `id_juego` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `noticia`
--
ALTER TABLE `noticia`
  MODIFY `id_noticia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `plataforma`
--
ALTER TABLE `plataforma`
  MODIFY `id_plataforma` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `resena`
--
ALTER TABLE `resena`
  MODIFY `id_resena` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `venta`
--
ALTER TABLE `venta`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id_wishlist` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `alerta`
--
ALTER TABLE `alerta`
  ADD CONSTRAINT `alerta_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `alerta_ibfk_2` FOREIGN KEY (`id_juego`) REFERENCES `juego` (`id_juego`);

--
-- Filtros para la tabla `crossplay`
--
ALTER TABLE `crossplay`
  ADD CONSTRAINT `crossplay_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `descuento`
--
ALTER TABLE `descuento`
  ADD CONSTRAINT `descuento_ibfk_1` FOREIGN KEY (`id_juego`) REFERENCES `juego` (`id_juego`),
  ADD CONSTRAINT `descuento_ibfk_2` FOREIGN KEY (`id_plataforma`) REFERENCES `plataforma` (`id_plataforma`);

--
-- Filtros para la tabla `historial_precios`
--
ALTER TABLE `historial_precios`
  ADD CONSTRAINT `historial_precios_ibfk_1` FOREIGN KEY (`id_juego`) REFERENCES `juego` (`id_juego`),
  ADD CONSTRAINT `historial_precios_ibfk_2` FOREIGN KEY (`id_plataforma`) REFERENCES `plataforma` (`id_plataforma`);

--
-- Filtros para la tabla `juego`
--
ALTER TABLE `juego`
  ADD CONSTRAINT `juego_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  ADD CONSTRAINT `juego_ibfk_2` FOREIGN KEY (`id_genero`) REFERENCES `genero` (`id_genero`),
  ADD CONSTRAINT `juego_ibfk_3` FOREIGN KEY (`id_desarrollador`) REFERENCES `desarrollador` (`id_desarrollador`),
  ADD CONSTRAINT `juego_ibfk_4` FOREIGN KEY (`id_noticia`) REFERENCES `noticia` (`id_noticia`);

--
-- Filtros para la tabla `resena`
--
ALTER TABLE `resena`
  ADD CONSTRAINT `resena_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `resena_ibfk_2` FOREIGN KEY (`id_juego`) REFERENCES `juego` (`id_juego`);

--
-- Filtros para la tabla `venta`
--
ALTER TABLE `venta`
  ADD CONSTRAINT `venta_ibfk_1` FOREIGN KEY (`id_juego`) REFERENCES `juego` (`id_juego`);

--
-- Filtros para la tabla `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`id_juego`) REFERENCES `juego` (`id_juego`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

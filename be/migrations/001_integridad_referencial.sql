-- =====================================================================
-- 001 — Integridad referencial y de dominio (criterio de calidad D2-4)
-- Idempotente: se puede ejecutar varias veces sin error.
--   Nueva BD : docker compose lo aplica automáticamente tras el esquema base.
--   BD actual: psql -h localhost -U promohunt -d descuentos_juegos -f migrations/001_integridad_referencial.sql
-- =====================================================================
BEGIN;

-- ---------------------------------------------------------------------
-- 1) Claves foráneas con política ON DELETE explícita
--    CASCADE  : el hijo no tiene sentido sin el padre
--    SET NULL : el padre es un atributo opcional del hijo
--    RESTRICT : se impide borrar el padre mientras tenga hijos (error 409 en la API)
-- ---------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      -- hijo,             columna,            padre,         col. padre,        política
      ('juego',            'id_categoria',     'categoria',   'id_categoria',    'SET NULL'),
      ('juego',            'id_genero',        'genero',      'id_genero',       'SET NULL'),
      ('juego',            'id_desarrollador', 'desarrollador','id_desarrollador','SET NULL'),
      ('juego',            'id_noticia',       'noticia',     'id_noticia',      'SET NULL'),
      ('descuento',        'id_juego',         'juego',       'id_juego',        'CASCADE'),
      ('descuento',        'id_plataforma',    'plataforma',  'id_plataforma',   'RESTRICT'),
      ('historial_precios','id_juego',         'juego',       'id_juego',        'CASCADE'),
      ('historial_precios','id_plataforma',    'plataforma',  'id_plataforma',   'RESTRICT'),
      ('venta',            'id_juego',         'juego',       'id_juego',        'CASCADE'),
      ('resena',           'id_juego',         'juego',       'id_juego',        'CASCADE'),
      ('resena',           'id_usuario',       'usuario',     'id_usuario',      'CASCADE'),
      ('wishlist',         'id_juego',         'juego',       'id_juego',        'CASCADE'),
      ('wishlist',         'id_usuario',       'usuario',     'id_usuario',      'CASCADE'),
      ('alerta',           'id_juego',         'juego',       'id_juego',        'CASCADE'),
      ('alerta',           'id_usuario',       'usuario',     'id_usuario',      'CASCADE'),
      ('crossplay',        'id_usuario',       'usuario',     'id_usuario',      'CASCADE')
    ) AS t(hijo, col, padre, colpadre, politica)
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.hijo, r.hijo||'_'||r.col||'_fkey');
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I(%I) ON DELETE %s',
                   r.hijo, r.hijo||'_'||r.col||'_fkey', r.col, r.padre, r.colpadre, r.politica);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 2) Restricciones de dominio (CHECK) y unicidad
-- ---------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('usuario',   'ck_usuario_rol',          'CHECK (rol IN (''admin'',''user''))'),
      ('usuario',   'ck_usuario_nombre',       'CHECK (length(trim(nombre)) >= 2)'),
      ('juego',     'ck_juego_edad',           'CHECK (edad_minima IS NULL OR edad_minima BETWEEN 0 AND 21)'),
      ('descuento', 'ck_descuento_precios',    'CHECK (precio_original >= 0 AND precio_descuento >= 0 AND precio_descuento <= precio_original)'),
      ('descuento', 'ck_descuento_porcentaje', 'CHECK (porcentaje_descuento IS NULL OR porcentaje_descuento BETWEEN 0 AND 100)'),
      ('descuento', 'ck_descuento_ahorro',     'CHECK (ahorro IS NULL OR ahorro >= 0)'),
      ('descuento', 'ck_descuento_fechas',     'CHECK (fecha_inicio IS NULL OR fecha_fin IS NULL OR fecha_fin >= fecha_inicio)'),
      ('descuento', 'ck_descuento_estado',     'CHECK (estado IN (''Activo'',''Inactivo'',''Expirado''))'),
      ('resena',    'ck_resena_calificacion',  'CHECK (calificacion BETWEEN 1 AND 5)'),
      ('alerta',    'ck_alerta_precio',        'CHECK (precio_objetivo > 0)'),
      ('venta',     'ck_venta_valores',        'CHECK (copias_vendidas >= 0 AND ingresos >= 0)'),
      ('historial_precios','ck_historial_precio','CHECK (precio >= 0)'),
      ('resena',    'uq_resena_usuario_juego', 'UNIQUE (id_usuario, id_juego)'),
      ('wishlist',  'uq_wishlist_usuario_juego','UNIQUE (id_usuario, id_juego)'),
      ('crossplay', 'uq_crossplay_usuario',    'UNIQUE (id_usuario)'),
      ('venta',     'uq_venta_juego',          'UNIQUE (id_juego)')
    ) AS t(tabla, nombre, def)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = r.nombre) THEN
      EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', r.tabla, r.nombre, r.def);
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- 3) Obligatoriedad en columnas críticas
-- ---------------------------------------------------------------------
ALTER TABLE usuario   ALTER COLUMN is_active   SET NOT NULL;
ALTER TABLE usuario   ALTER COLUMN is_verified SET NOT NULL;
ALTER TABLE descuento ALTER COLUMN estado      SET NOT NULL;
ALTER TABLE juego     ALTER COLUMN estado      SET NOT NULL;

COMMIT;

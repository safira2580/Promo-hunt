-- Idempotente. Calificación (0 a 5 estrellas) que tiene cada juego en cada tienda.
CREATE TABLE IF NOT EXISTS calificacion_tienda (
  id_calificacion SERIAL PRIMARY KEY,
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego) ON DELETE CASCADE,
  id_plataforma INTEGER NOT NULL REFERENCES plataforma(id_plataforma) ON DELETE CASCADE,
  puntuacion NUMERIC(2,1) NOT NULL CHECK (puntuacion BETWEEN 0 AND 5),
  total_votos INTEGER NOT NULL DEFAULT 0,
  UNIQUE (id_juego, id_plataforma)
);

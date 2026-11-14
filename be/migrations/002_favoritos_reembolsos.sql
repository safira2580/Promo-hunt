-- Idempotente. Si las tablas ya existen en Railway con otras columnas, revisa antes con \d favorito y \d reembolso.
CREATE TABLE IF NOT EXISTS favorito (
  id_favorito SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego) ON DELETE CASCADE,
  fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id_usuario, id_juego)
);

CREATE TABLE IF NOT EXISTS reembolso (
  id_reembolso SERIAL PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_juego INTEGER NOT NULL REFERENCES juego(id_juego) ON DELETE CASCADE,
  motivo TEXT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

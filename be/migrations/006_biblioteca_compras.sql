-- =====================================================================
-- 006 — Compras (validación de pago) y biblioteca de juegos del usuario
-- Idempotente: se puede ejecutar varias veces sin error.
--   BD local  : docker exec -i promohunt_db psql -U promohunt -d descuentos_juegos < be/migrations/006_biblioteca_compras.sql
--   Railway   : psql "<DATABASE_URL pública>" -f be/migrations/006_biblioteca_compras.sql
-- =====================================================================
BEGIN;

-- El precio (monto) lo fija SIEMPRE el servidor al crear la compra, nunca el cliente.
--   pendiente -> pagada | rechazada
CREATE TABLE IF NOT EXISTS compra (
  id_compra      SERIAL PRIMARY KEY,
  id_usuario     INTEGER NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  id_juego       INTEGER NOT NULL REFERENCES juego(id_juego)     ON DELETE RESTRICT,
  id_descuento   INTEGER REFERENCES descuento(id_descuento)      ON DELETE SET NULL,
  id_plataforma  INTEGER REFERENCES plataforma(id_plataforma)    ON DELETE SET NULL,
  monto          DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
  referencia     VARCHAR(40)  NOT NULL UNIQUE,
  estado         VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                 CHECK (estado IN ('pendiente','pagada','rechazada')),
  metodo_pago    VARCHAR(30),
  fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_pago     TIMESTAMP
);

-- Un usuario no puede tener dos compras activas (pendiente/pagada) del mismo juego.
CREATE UNIQUE INDEX IF NOT EXISTS ux_compra_activa
  ON compra (id_usuario, id_juego) WHERE estado IN ('pendiente','pagada');
CREATE INDEX IF NOT EXISTS ix_compra_usuario ON compra (id_usuario, estado);

COMMIT;

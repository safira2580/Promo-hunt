-- Idempotente. Enlace directo a la página del juego en cada tienda.
ALTER TABLE descuento ADD COLUMN IF NOT EXISTS url_juego VARCHAR(500);

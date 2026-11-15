-- Idempotente. Steam califica con "me gusta / no me gusta" (reseñas positivas y negativas).
ALTER TABLE calificacion_tienda ADD COLUMN IF NOT EXISTS votos_positivos INTEGER;
ALTER TABLE calificacion_tienda ADD COLUMN IF NOT EXISTS votos_negativos INTEGER;
ALTER TABLE calificacion_tienda ALTER COLUMN puntuacion DROP NOT NULL;

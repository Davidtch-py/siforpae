-- Primero, eliminamos la columna existente
ALTER TABLE complementos DROP COLUMN IF EXISTS unidad_gramos;

-- Agregamos las nuevas columnas para cada grupo etáreo
ALTER TABLE complementos 
  ADD COLUMN IF NOT EXISTS gramos_preescolar numeric,
  ADD COLUMN IF NOT EXISTS gramos_primaria numeric,
  ADD COLUMN IF NOT EXISTS gramos_cuarto_quinto numeric,
  ADD COLUMN IF NOT EXISTS gramos_secundaria numeric;

-- Actualizamos el tipo en TypeScript
COMMENT ON TABLE complementos IS 'Tabla de complementos con cantidades por grupo etáreo';
COMMENT ON COLUMN complementos.gramos_preescolar IS 'Cantidad en gramos para nivel preescolar';
COMMENT ON COLUMN complementos.gramos_primaria IS 'Cantidad en gramos para 1ro a 3er grado';
COMMENT ON COLUMN complementos.gramos_cuarto_quinto IS 'Cantidad en gramos para 4to y 5to grado';
COMMENT ON COLUMN complementos.gramos_secundaria IS 'Cantidad en gramos para 6to a 8vo grado'; 
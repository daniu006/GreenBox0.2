-- Actualizar niveles mínimos de humedad del suelo para las plantas

-- Fresa: requiere suelo húmedo, 60% mínimo
UPDATE plants 
SET "minSoilMoisture" = 60.0 
WHERE LOWER(name) LIKE '%fresa%';

-- Menta: requiere suelo moderadamente húmedo, 50% mínimo
UPDATE plants 
SET "minSoilMoisture" = 50.0 
WHERE LOWER(name) LIKE '%menta%';

-- Poto (Pothos): tolera suelo más seco, 40% mínimo
UPDATE plants 
SET "minSoilMoisture" = 40.0 
WHERE LOWER(name) LIKE '%poto%' OR LOWER(name) LIKE '%pothos%';

-- Verificar los cambios
SELECT id, name, "minSoilMoisture", "minHumidity", "maxHumidity" 
FROM plants 
WHERE LOWER(name) LIKE '%fresa%' 
   OR LOWER(name) LIKE '%menta%' 
   OR LOWER(name) LIKE '%poto%'
   OR LOWER(name) LIKE '%pothos%';

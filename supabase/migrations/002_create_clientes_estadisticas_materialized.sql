-- Migration: Create materialized view for clientes_estadisticas (OPTIONAL)
-- Description: Cached version of clientes_estadisticas for better performance with large datasets
-- Use Case: Use this if you have > 1000 clients or the regular view is slow
-- Author: GitHub Copilot
-- Date: 2026-01-21

-- Drop materialized view if exists
DROP MATERIALIZED VIEW IF EXISTS clientes_estadisticas_mv;

-- Create materialized view
CREATE MATERIALIZED VIEW clientes_estadisticas_mv AS
SELECT 
    c.id,
    c.nombre,
    c.email,
    c.contacto,
    c.es_menor,
    c.nombre_responsable,
    c.sexo,
    c.created_at,
    c.updated_at,
    c.deleted_at,
    
    -- Estadísticas calculadas
    COALESCE(SUM(CASE 
        WHEN citas.fue_cancelado = false THEN citas.monto_total_pyg 
        ELSE 0 
    END), 0) AS total_facturado,
    
    COUNT(CASE 
        WHEN citas.fue_cancelado = false THEN 1 
    END) AS cantidad_citas,
    
    COALESCE(AVG(CASE 
        WHEN citas.fue_cancelado = false THEN citas.monto_total_pyg 
    END), 0) AS monto_promedio,
    
    MAX(CASE 
        WHEN citas.fue_cancelado = false THEN citas.fecha_hora 
    END) AS ultima_visita

FROM clientes c
LEFT JOIN citas ON c.id = citas.cliente_id
GROUP BY 
    c.id,
    c.nombre,
    c.email,
    c.contacto,
    c.es_menor,
    c.nombre_responsable,
    c.sexo,
    c.created_at,
    c.updated_at,
    c.deleted_at;

-- Create indexes for better query performance
CREATE INDEX idx_clientes_estadisticas_mv_id ON clientes_estadisticas_mv(id);
CREATE INDEX idx_clientes_estadisticas_mv_total_facturado ON clientes_estadisticas_mv(total_facturado DESC);
CREATE INDEX idx_clientes_estadisticas_mv_cantidad_citas ON clientes_estadisticas_mv(cantidad_citas DESC);
CREATE INDEX idx_clientes_estadisticas_mv_ultima_visita ON clientes_estadisticas_mv(ultima_visita DESC);

-- Add comment
COMMENT ON MATERIALIZED VIEW clientes_estadisticas_mv IS 'Vista materializada con estadísticas de clientes. Requiere refresh periódico con REFRESH MATERIALIZED VIEW clientes_estadisticas_mv;';

-- Grant permissions
GRANT SELECT ON clientes_estadisticas_mv TO authenticated;

-- Create refresh function
CREATE OR REPLACE FUNCTION refresh_clientes_estadisticas()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY clientes_estadisticas_mv;
END;
$$ LANGUAGE plpgsql;

-- Add comment to function
COMMENT ON FUNCTION refresh_clientes_estadisticas IS 'Función para refrescar la vista materializada de estadísticas de clientes';

-- SETUP INSTRUCTIONS FOR AUTO-REFRESH:
-- 
-- Option 1: Manual refresh (run this SQL when needed)
-- SELECT refresh_clientes_estadisticas();
--
-- Option 2: Scheduled refresh with pg_cron (recommended)
-- First, enable pg_cron extension in Supabase Dashboard
-- Then run:
-- SELECT cron.schedule(
--     'refresh-clientes-estadisticas',
--     '*/15 * * * *', -- Every 15 minutes
--     'SELECT refresh_clientes_estadisticas();'
-- );
--
-- To view scheduled jobs:
-- SELECT * FROM cron.job;
--
-- To remove scheduled job:
-- SELECT cron.unschedule('refresh-clientes-estadisticas');

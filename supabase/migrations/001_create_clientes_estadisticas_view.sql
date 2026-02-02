-- Migration: Create clientes_estadisticas view
-- Description: Pre-calculates client statistics for better performance
-- Author: GitHub Copilot
-- Date: 2026-01-21

-- Drop view if exists (for re-running migration)
DROP VIEW IF EXISTS clientes_estadisticas;

-- Create view with client statistics
CREATE VIEW clientes_estadisticas AS
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

-- Add comment to view
COMMENT ON VIEW clientes_estadisticas IS 'Vista que pre-calcula estadísticas de clientes: total facturado, cantidad de citas, monto promedio y última visita';

-- Grant permissions (adjust role as needed)
GRANT SELECT ON clientes_estadisticas TO authenticated;

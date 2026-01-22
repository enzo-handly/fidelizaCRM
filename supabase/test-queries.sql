-- Test Queries for clientes_estadisticas view
-- Run these after creating the view to verify it works correctly

-- 1. Basic test: View all statistics
SELECT * FROM clientes_estadisticas LIMIT 10;

-- 2. Check specific client statistics
SELECT 
    nombre,
    email,
    total_facturado,
    cantidad_citas,
    monto_promedio,
    ultima_visita
FROM clientes_estadisticas
WHERE nombre ILIKE '%test%' -- Replace with actual client name
LIMIT 5;

-- 3. Top 10 clients by revenue
SELECT 
    nombre,
    email,
    total_facturado,
    cantidad_citas,
    monto_promedio
FROM clientes_estadisticas
ORDER BY total_facturado DESC
LIMIT 10;

-- 4. Top 10 clients by number of appointments
SELECT 
    nombre,
    email,
    cantidad_citas,
    total_facturado,
    ultima_visita
FROM clientes_estadisticas
ORDER BY cantidad_citas DESC
LIMIT 10;

-- 5. Clients with highest average spending per appointment
SELECT 
    nombre,
    email,
    monto_promedio,
    cantidad_citas,
    total_facturado
FROM clientes_estadisticas
WHERE cantidad_citas > 0
ORDER BY monto_promedio DESC
LIMIT 10;

-- 6. Recent clients (last visit in last 30 days)
SELECT 
    nombre,
    email,
    ultima_visita,
    cantidad_citas,
    total_facturado
FROM clientes_estadisticas
WHERE ultima_visita >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY ultima_visita DESC;

-- 7. Inactive clients (no visits in last 90 days)
SELECT 
    nombre,
    email,
    ultima_visita,
    cantidad_citas,
    total_facturado
FROM clientes_estadisticas
WHERE ultima_visita < CURRENT_DATE - INTERVAL '90 days'
   OR ultima_visita IS NULL
ORDER BY ultima_visita DESC NULLS LAST;

-- 8. Statistics summary
SELECT 
    COUNT(*) AS total_clientes,
    SUM(total_facturado) AS facturacion_total,
    AVG(total_facturado) AS facturacion_promedio_por_cliente,
    SUM(cantidad_citas) AS total_citas,
    AVG(cantidad_citas) AS promedio_citas_por_cliente
FROM clientes_estadisticas;

-- 9. Verify calculations manually (compare with view)
-- This query calculates statistics the "old way" for comparison
SELECT 
    c.id,
    c.nombre,
    COALESCE(SUM(CASE WHEN citas.fue_cancelado = false THEN citas.monto_total_pyg ELSE 0 END), 0) AS total_facturado_manual,
    COUNT(CASE WHEN citas.fue_cancelado = false THEN 1 END) AS cantidad_citas_manual
FROM clientes c
LEFT JOIN citas ON c.id = citas.cliente_id
GROUP BY c.id, c.nombre
LIMIT 5;

-- Compare with view:
SELECT 
    id,
    nombre,
    total_facturado,
    cantidad_citas
FROM clientes_estadisticas
LIMIT 5;

-- 10. Performance test: Check query execution time
EXPLAIN ANALYZE
SELECT * FROM clientes_estadisticas
WHERE total_facturado > 1000
ORDER BY total_facturado DESC
LIMIT 20;

-- 11. Test filtering and sorting (common use case)
SELECT 
    nombre,
    email,
    contacto,
    total_facturado,
    cantidad_citas,
    monto_promedio,
    ultima_visita
FROM clientes_estadisticas
WHERE 
    nombre ILIKE '%a%' OR 
    email ILIKE '%a%' OR 
    contacto ILIKE '%a%'
ORDER BY total_facturado DESC
LIMIT 50;

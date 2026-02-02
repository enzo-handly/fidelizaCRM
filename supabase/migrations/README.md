# Database Migrations

## Overview
This folder contains SQL migration scripts for the fidelizaCRM database.

## Files

### 001_create_clientes_estadisticas_view.sql
**Required**: Creates a regular view for client statistics.
- **Use Case**: Real-time statistics, always up-to-date
- **Performance**: Good for < 1000 clients
- **Maintenance**: No maintenance needed (auto-updates)

**How to apply:**
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `001_create_clientes_estadisticas_view.sql`
3. Click "Run"
4. Verify with: `SELECT * FROM clientes_estadisticas LIMIT 10;`

### 002_create_clientes_estadisticas_materialized.sql
**Optional**: Creates a materialized view for better performance.
- **Use Case**: > 1000 clients or slow queries
- **Performance**: Much faster queries, cached results
- **Maintenance**: Requires periodic refresh (manual or scheduled)

**How to apply:**
1. Only apply this if the regular view (001) is too slow
2. Open Supabase Dashboard → SQL Editor
3. Copy and paste the entire contents of `002_create_clientes_estadisticas_materialized.sql`
4. Click "Run"
5. Set up auto-refresh (see instructions in the SQL file)

## Testing

After applying migration 001, test with:

```sql
-- Verify view exists
SELECT * FROM clientes_estadisticas LIMIT 10;

-- Check statistics for a specific client
SELECT 
    nombre,
    total_facturado,
    cantidad_citas,
    monto_promedio,
    ultima_visita
FROM clientes_estadisticas
WHERE id = 'your-client-id';

-- Find top clients by revenue
SELECT 
    nombre,
    total_facturado,
    cantidad_citas
FROM clientes_estadisticas
ORDER BY total_facturado DESC
LIMIT 10;
```

## Performance Comparison

| Metric | Regular View | Materialized View |
|--------|-------------|-------------------|
| Data Freshness | Real-time | Cached (requires refresh) |
| Query Speed | Fast (< 1000 records) | Very fast (any size) |
| Maintenance | None | Periodic refresh needed |
| Storage | No extra storage | Stores cached results |

## Choosing Between Views

**Use Regular View (001) if:**
- You have < 1000 clients
- You need real-time data
- Query performance is acceptable

**Use Materialized View (002) if:**
- You have > 1000 clients
- Query performance is slow
- You can tolerate slight data lag (refresh interval)

## Application Integration

After creating the view, update your application code:

1. **Types** (`lib/types.ts`): Add ClienteEstadisticas interface
2. **Actions** (`app/actions/clientes.ts`): Query the view instead of calculating
3. **Page** (`app/dashboard/clientes/page.tsx`): Use the view
4. **Table** (`components/dashboard/clientes/clientes-table.tsx`): Display statistics

## Troubleshooting

### View not found
- Make sure you ran the migration in Supabase SQL Editor
- Check for errors in the SQL Editor output

### Statistics seem incorrect
- Verify the view logic with manual calculations
- Check if `fue_cancelado` filtering is working correctly
- Run test queries to compare results

### Slow performance
- Check how many clients you have: `SELECT COUNT(*) FROM clientes;`
- If > 1000, consider using the materialized view (002)
- Add indexes if needed (already included in 002)

## Rollback

To remove the views:

```sql
-- Remove regular view
DROP VIEW IF EXISTS clientes_estadisticas;

-- Remove materialized view (if created)
DROP MATERIALIZED VIEW IF EXISTS clientes_estadisticas_mv;
DROP FUNCTION IF EXISTS refresh_clientes_estadisticas();
```

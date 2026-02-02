import { useState, useMemo } from "react"
import type { ClienteConEstadisticas } from "@/lib/types"

/**
 * Filter options for clientes
 */
export interface ClientesFilterOptions {
  totalFacturadoMin?: number
  totalFacturadoMax?: number
  ultimaVisitaFrom?: string
  ultimaVisitaTo?: string
  esMenor?: boolean | null
}

/**
 * Options for useClientesFilters hook
 */
export interface UseClientesFiltersOptions {
  clientes: ClienteConEstadisticas[]
}

/**
 * Return value from useClientesFilters hook
 */
export interface UseClientesFiltersReturn {
  filters: ClientesFilterOptions
  setFilters: (filters: ClientesFilterOptions) => void
  filteredClientes: ClienteConEstadisticas[]
  clearFilters: () => void
  hasActiveFilters: boolean
}

/**
 * Custom hook for filtering clientes with advanced criteria
 * Implements Single Responsibility Principle - handles only filtering logic
 * 
 * @example
 * ```tsx
 * const { filters, setFilters, filteredClientes } = useClientesFilters({
 *   clientes
 * })
 * ```
 */
export function useClientesFilters({
  clientes,
}: UseClientesFiltersOptions): UseClientesFiltersReturn {
  const [filters, setFilters] = useState<ClientesFilterOptions>({})

  /**
   * Apply all active filters to clientes list
   */
  const filteredClientes = useMemo(() => {
    let result = clientes

    // Filter by total facturado range
    if (filters.totalFacturadoMin !== undefined) {
      result = result.filter(
        (cliente) => cliente.total_facturado >= filters.totalFacturadoMin!
      )
    }
    if (filters.totalFacturadoMax !== undefined) {
      result = result.filter(
        (cliente) => cliente.total_facturado <= filters.totalFacturadoMax!
      )
    }

    // Filter by ultima visita date range
    if (filters.ultimaVisitaFrom) {
      const fromDate = new Date(filters.ultimaVisitaFrom)
      result = result.filter((cliente) => {
        if (!cliente.ultima_visita) return false
        return new Date(cliente.ultima_visita) >= fromDate
      })
    }
    if (filters.ultimaVisitaTo) {
      const toDate = new Date(filters.ultimaVisitaTo)
      toDate.setHours(23, 59, 59, 999) // Include entire day
      result = result.filter((cliente) => {
        if (!cliente.ultima_visita) return false
        return new Date(cliente.ultima_visita) <= toDate
      })
    }

    // Filter by es_menor
    if (filters.esMenor !== undefined && filters.esMenor !== null) {
      result = result.filter((cliente) => cliente.es_menor === filters.esMenor)
    }

    return result
  }, [clientes, filters])

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({})
  }

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.totalFacturadoMin !== undefined ||
      filters.totalFacturadoMax !== undefined ||
      filters.ultimaVisitaFrom !== undefined ||
      filters.ultimaVisitaTo !== undefined ||
      (filters.esMenor !== undefined && filters.esMenor !== null)
    )
  }, [filters])

  return {
    filters,
    setFilters,
    filteredClientes,
    clearFilters,
    hasActiveFilters,
  }
}

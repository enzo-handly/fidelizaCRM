import { useState, useMemo } from "react"

/**
 * Sort direction types
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * Generic sortable item with string keys
 */
export interface SortableItem {
  [key: string]: any
}

/**
 * Options for useTableSort hook
 */
export interface UseTableSortOptions<T extends SortableItem> {
  items: T[]
  initialSortField?: keyof T
  initialSortDirection?: SortDirection
}

/**
 * Return value from useTableSort hook
 */
export interface UseTableSortReturn<T extends SortableItem> {
  sortedItems: T[]
  sortField: keyof T | null
  sortDirection: SortDirection
  handleSort: (field: keyof T) => void
}

/**
 * Custom hook for table sorting logic
 * Implements Single Responsibility Principle - handles only sorting concerns
 * 
 * @example
 * ```tsx
 * const { sortedItems, sortField, sortDirection, handleSort } = useTableSort({
 *   items: clientes,
 *   initialSortField: 'nombre',
 *   initialSortDirection: 'asc'
 * })
 * ```
 */
export function useTableSort<T extends SortableItem>({
  items,
  initialSortField,
  initialSortDirection = null,
}: UseTableSortOptions<T>): UseTableSortReturn<T> {
  const [sortField, setSortField] = useState<keyof T | null>(initialSortField ?? null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection)

  /**
   * Handle sort field change
   * Cycles through: asc -> desc -> null
   */
  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      // Cycle through sort directions
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  /**
   * Sort items based on current sort field and direction
   * Uses useMemo for performance optimization
   */
  const sortedItems = useMemo(() => {
    if (!sortField || !sortDirection) {
      return items
    }

    return [...items].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) {
        return sortDirection === 'asc' ? 1 : -1
      }
      if (bVal === null || bVal === undefined) {
        return sortDirection === 'asc' ? -1 : 1
      }

      // String comparison
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      // Date comparison
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc' 
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime()
      }

      // Default comparison (converts to string)
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [items, sortField, sortDirection])

  return {
    sortedItems,
    sortField,
    sortDirection,
    handleSort,
  }
}

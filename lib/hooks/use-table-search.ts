"use client"

import { useState, useMemo } from "react"
import type { TableSearchOptions, TableSearchReturn } from "./types"

/**
 * Hook for table search functionality
 * 
 * Provides:
 * - Search query state management
 * - Filtered items based on searchable fields
 * - Support for custom filter functions
 * 
 * @example
 * ```tsx
 * const { searchQuery, setSearchQuery, filteredItems, clearSearch } = useTableSearch({
 *   items: clientes,
 *   searchableFields: ["nombre", "contacto", "email"]
 * })
 * 
 * <Input 
 *   value={searchQuery}
 *   onChange={(e) => setSearchQuery(e.target.value)}
 *   placeholder="Buscar..."
 * />
 * 
 * {filteredItems.map(item => <Row key={item.id} {...item} />)}
 * ```
 */
export function useTableSearch<T extends Record<string, any>>({
  items,
  searchableFields,
  customFilter,
}: TableSearchOptions<T>): TableSearchReturn<T> {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items
    }

    const query = searchQuery.toLowerCase().trim()

    return items.filter((item) => {
      // Use custom filter if provided
      if (customFilter) {
        return customFilter(item, query)
      }

      // Default: search in all searchable fields
      return searchableFields.some((field) => {
        const value = item[field]
        if (value === null || value === undefined) return false

        // Convert to string and search
        return String(value).toLowerCase().includes(query)
      })
    })
  }, [items, searchQuery, searchableFields, customFilter])

  const clearSearch = () => {
    setSearchQuery("")
  }

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    clearSearch,
  }
}

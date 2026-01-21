"use client"

import { useCallback } from "react"

/**
 * Hook for consistent PYG price formatting
 * 
 * Provides utilities for:
 * - Formatting prices for display (₲ 150.000)
 * - Parsing price input strings to numbers
 * - Formatting input values (handles user typing)
 * 
 * @example
 * ```tsx
 * const { formatPrice, parsePrice, formatPriceInput } = usePriceFormatter()
 * 
 * // Display
 * <p>{formatPrice(150000)}</p> // "₲ 150.000"
 * 
 * // Input handling
 * <input 
 *   value={formatPriceInput(precio)}
 *   onChange={(e) => setPrecio(parsePrice(e.target.value))}
 * />
 * ```
 */
export function usePriceFormatter() {
  /**
   * Format a number as PYG currency
   * @param value - Number to format
   * @returns Formatted string (e.g., "₲ 150.000")
   */
  const formatPrice = useCallback((value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "₲ 0"
    }

    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  /**
   * Parse a price string to number
   * Handles various formats: "150000", "150.000", "₲ 150.000"
   * @param value - String to parse
   * @returns Parsed number
   */
  const parsePrice = useCallback((value: string): number => {
    // Remove currency symbol, spaces, and dots
    const cleaned = value.replace(/[₲\s.]/g, "")
    const parsed = parseInt(cleaned, 10)
    return isNaN(parsed) ? 0 : parsed
  }, [])

  /**
   * Format price for input field (no currency symbol, with thousand separators)
   * @param value - Number to format
   * @returns Formatted string for input (e.g., "150.000")
   */
  const formatPriceInput = useCallback((value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0"
    }

    return new Intl.NumberFormat("es-PY", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  return {
    formatPrice,
    parsePrice,
    formatPriceInput,
  }
}

/**
 * Utility functions for formatting client statistics
 * Follows Single Responsibility Principle - only formatting logic
 */

import { formatCurrency } from "./formatters"

/**
 * Format client statistics for display
 */
export const formatClienteStats = {
  /**
   * Format total facturado as currency
   */
  totalFacturado: (amount: number): string => formatCurrency(amount),

  /**
   * Format cantidad de citas as number
   */
  cantidadCitas: (cantidad: number): string => String(cantidad),

  /**
   * Format monto promedio as currency
   */
  montoPromedio: (amount: number): string => formatCurrency(amount),

  /**
   * Format ultima visita date or return placeholder
   */
  ultimaVisita: (date: string | null): string => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  },
}

/**
 * Get display label for sexo field
 */
export function getSexoLabel(sexo: string | null): string {
  switch (sexo) {
    case "masculino":
      return "M"
    case "femenino":
      return "F"
    case "otro":
      return "O"
    default:
      return "-"
  }
}

/**
 * Format date string to localized format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

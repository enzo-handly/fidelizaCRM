/**
 * Format price in Paraguayan Guaraníes (PYG)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PY", {
    style: "currency",
    currency: "PYG",
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * Alias for formatPrice - Format currency in PYG
 */
export const formatCurrency = formatPrice

/**
 * Format date to localized string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Format datetime to localized string
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("es-PY", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format time only
 */
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("es-PY", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format phone number (basic)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  
  // Format as XXX-XXX-XXX for Paraguay numbers
  if (digits.length === 9) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  return phone
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

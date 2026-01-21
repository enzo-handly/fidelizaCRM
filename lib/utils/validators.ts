/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (basic Paraguay format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")
  // Paraguay numbers are typically 9 digits
  return digits.length >= 6 && digits.length <= 15
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, " ")
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date
  return targetDate < new Date()
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const targetDate = typeof date === "string" ? new Date(date) : date
  return targetDate > new Date()
}

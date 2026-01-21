import { AppError, DatabaseError } from "./app-errors"
import type { PostgrestError } from "@supabase/supabase-js"

/**
 * Standard action result type
 */
export type ActionResult<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

/**
 * Convert any error to a standardized ActionResult
 */
export function handleError<T = void>(error: unknown): ActionResult<T> {
  // Log error for debugging
  console.error("[Error Handler]", error)

  // Handle known AppError types
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code
    }
  }

  // Handle Supabase PostgrestError
  if (isPostgrestError(error)) {
    return {
      success: false,
      error: `Error de base de datos: ${error.message}`,
      code: "DB_ERROR"
    }
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: "UNKNOWN_ERROR"
    }
  }

  // Handle unknown errors
  return {
    success: false,
    error: "Ha ocurrido un error inesperado",
    code: "UNKNOWN_ERROR"
  }
}

/**
 * Create a success result
 */
export function success<T>(data: T): ActionResult<T> {
  return { success: true, data }
}

/**
 * Type guard for PostgrestError
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "details" in error
  )
}

/**
 * Wrap async functions with automatic error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return success(data)
  } catch (error) {
    return handleError(error)
  }
}

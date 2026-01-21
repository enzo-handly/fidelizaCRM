/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Authentication errors (401)
 */
export class AuthenticationError extends AppError {
  constructor(message = "No autenticado") {
    super(message, "AUTH_001", 401)
  }
}

/**
 * Authorization errors (403)
 */
export class AuthorizationError extends AppError {
  constructor(message = "No autorizado") {
    super(message, "AUTH_002", 403)
  }
}

/**
 * Resource not found errors (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} con ID ${id} no encontrado`
      : `${resource} no encontrado`
    super(message, "NOT_FOUND", 404, { resource, id })
  }
}

/**
 * Validation errors (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, "VALIDATION_ERROR", 400, fields)
  }
}

/**
 * Database operation errors (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: unknown) {
    super(message, "DB_ERROR", 500, originalError)
  }
}

/**
 * Business logic errors (422)
 */
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, "BUSINESS_ERROR", 422, details)
  }
}

/**
 * External service errors (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, originalError?: unknown) {
    super(`Error en servicio externo ${service}: ${message}`, "EXTERNAL_SERVICE_ERROR", 502, originalError)
  }
}

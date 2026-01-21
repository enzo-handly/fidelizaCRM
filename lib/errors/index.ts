/**
 * Central exports for error handling
 */

// Error classes
export {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  DatabaseError,
  BusinessLogicError,
  ExternalServiceError
} from "./app-errors"

// Error handling utilities
export {
  handleError,
  success,
  withErrorHandling,
  type ActionResult
} from "./error-handler"

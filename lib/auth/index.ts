/**
 * Central exports for authentication and authorization
 */

export {
  getAuthenticatedUser,
  getUserProfile,
  withAuth,
  requireAdmin,
  requireUser,
  type AuthContext,
  type AuthOptions
} from "./middleware"

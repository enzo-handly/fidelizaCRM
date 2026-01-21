import { createClient } from "@/lib/supabase/server"
import { AuthenticationError, AuthorizationError } from "@/lib/errors/app-errors"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

/**
 * Authentication context returned by auth middleware
 */
export interface AuthContext {
  supabase: SupabaseClient
  user: User
  profile: Profile
}

/**
 * Options for authentication middleware
 */
export interface AuthOptions {
  requireRole?: "admin" | "user"
  requireActive?: boolean
}

/**
 * Get authenticated user or throw error
 */
export async function getAuthenticatedUser(): Promise<{ supabase: SupabaseClient; user: User }> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new AuthenticationError("Debe iniciar sesión para continuar")
  }
  
  return { supabase, user }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error || !profile) {
    throw new AuthenticationError("Perfil de usuario no encontrado")
  }

  return profile as Profile
}

/**
 * Middleware to require authentication and optionally check role
 */
export async function withAuth(options: AuthOptions = {}): Promise<AuthContext> {
  const { requireRole, requireActive = true } = options
  
  // Get authenticated user
  const { supabase, user } = await getAuthenticatedUser()
  
  // Get user profile
  const profile = await getUserProfile(supabase, user.id)
  
  // Check if user is active
  if (requireActive && !profile.activo) {
    throw new AuthorizationError("Su cuenta ha sido desactivada")
  }
  
  // Check role if required
  if (requireRole && profile.role !== requireRole) {
    throw new AuthorizationError(`Se requiere rol de ${requireRole} para esta acción`)
  }
  
  return { supabase, user, profile }
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(): Promise<AuthContext> {
  return withAuth({ requireRole: "admin" })
}

/**
 * Middleware to require active user (any role)
 */
export async function requireUser(): Promise<AuthContext> {
  return withAuth({ requireRole: "user" })
}

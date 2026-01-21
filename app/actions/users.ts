"use server"

import { createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/auth/middleware"
import { handleError, type ActionResult } from "@/lib/errors/error-handler"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import { UserService } from "@/lib/services/user-service"
import type { Profile } from "@/lib/types"

// Re-export types for backward compatibility
export interface CreateUserData {
  email: string
  password: string
  full_name: string
  role: "admin" | "user"
}

export interface UpdateUserData {
  full_name: string
  role: "admin" | "user"
}

/**
 * Create a new user
 * Requires admin role
 */
export async function createUser(data: CreateUserData): Promise<ActionResult<Profile>> {
  try {
    // Require admin authentication
    const { user } = await requireAdmin()
    
    // Get service client for admin operations
    const serviceClient = await createServiceClient()
    
    // Create service instances
    const repository = new ProfileRepository(serviceClient)
    const service = new UserService(repository, serviceClient)
    
    // Create user (includes auth and profile)
    const profile = await service.create(data)
    
    // Revalidate cache
    revalidatePath("/dashboard/users")
    revalidatePath("/dashboard/usuarios")
    
    return { success: true, data: profile }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update user profile
 * Requires admin role
 */
export async function updateUser(userId: string, data: UpdateUserData): Promise<ActionResult<Profile>> {
  try {
    // Require admin authentication
    await requireAdmin()
    
    // Get service client
    const serviceClient = await createServiceClient()
    
    // Create service instances
    const repository = new ProfileRepository(serviceClient)
    const service = new UserService(repository, serviceClient)
    
    // Update user
    const profile = await service.update(userId, data)
    
    // Revalidate cache
    revalidatePath("/dashboard/users")
    revalidatePath("/dashboard/usuarios")
    
    return { success: true, data: profile }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete a user
 * Requires admin role
 */
export async function deleteUser(userId: string): Promise<ActionResult<void>> {
  try {
    // Require admin authentication
    const { user } = await requireAdmin()
    
    // Get service client
    const serviceClient = await createServiceClient()
    
    // Create service instances
    const repository = new ProfileRepository(serviceClient)
    const service = new UserService(repository, serviceClient)
    
    // Delete user (includes business logic check)
    await service.delete(userId, user.id)
    
    // Revalidate cache
    revalidatePath("/dashboard/users")
    revalidatePath("/dashboard/usuarios")
    
    return { success: true, data: undefined }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Toggle user active status
 * Requires admin role
 */
export async function toggleUserActive(userId: string, activo: boolean): Promise<ActionResult<Profile>> {
  try {
    // Require admin authentication
    const { user } = await requireAdmin()
    
    // Get service client
    const serviceClient = await createServiceClient()
    
    // Create service instances
    const repository = new ProfileRepository(serviceClient)
    const service = new UserService(repository, serviceClient)
    
    // Toggle active status (includes business logic check)
    const profile = await service.toggleActive(userId, activo, user.id)
    
    // Revalidate cache
    revalidatePath("/dashboard/usuarios")
    
    return { success: true, data: profile }
  } catch (error) {
    return handleError(error)
  }
}


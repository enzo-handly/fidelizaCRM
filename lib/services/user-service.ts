import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProfileRepository, UpdateProfileDTO } from "@/lib/repositories/profile-repository"
import type { Profile } from "@/lib/types"
import { ValidationError, BusinessLogicError, ExternalServiceError } from "@/lib/errors/app-errors"
import { isValidEmail } from "@/lib/utils/validators"

/**
 * DTO for creating a new user (includes auth data)
 */
export interface CreateUserDTO {
  email: string
  password: string
  full_name: string
  role: "admin" | "user"
}

/**
 * Service for User/Profile business logic
 */
export class UserService {
  constructor(
    private repository: ProfileRepository,
    private serviceClient: SupabaseClient
  ) {}

  /**
   * Get all users
   */
  async getAll(): Promise<Profile[]> {
    return this.repository.findAll("full_name")
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<Profile | null> {
    return this.repository.findById(id)
  }

  /**
   * Get active users
   */
  async getActive(): Promise<Profile[]> {
    return this.repository.findActive()
  }

  /**
   * Get users by role
   */
  async getByRole(role: "admin" | "user"): Promise<Profile[]> {
    return this.repository.findByRole(role)
  }

  /**
   * Create a new user with authentication
   * Requires service role client
   */
  async create(data: CreateUserDTO): Promise<Profile> {
    // Validate input
    this.validateUserData(data)

    // Check if email already exists
    const existing = await this.repository.findByEmail(data.email)
    if (existing) {
      throw new BusinessLogicError(`El email ${data.email} ya está en uso`)
    }

    // Create auth user using service client
    const { data: authUser, error: authError } = await this.serviceClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name,
        role: data.role,
      },
    })

    if (authError || !authUser.user) {
      throw new ExternalServiceError("Supabase Auth", authError?.message || "No se pudo crear el usuario")
    }

    // Profile should be created automatically by database trigger
    // Wait a moment and fetch the created profile
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const profile = await this.repository.findById(authUser.user.id)
    if (!profile) {
      throw new DatabaseError("Perfil de usuario no fue creado automáticamente")
    }

    return profile
  }

  /**
   * Update user profile
   */
  async update(userId: string, data: UpdateProfileDTO): Promise<Profile> {
    // Validate that user exists
    const existing = await this.repository.findById(userId)
    if (!existing) {
      throw new ValidationError(`Usuario con ID ${userId} no encontrado`)
    }

    // Validate full_name if provided
    if (data.full_name !== undefined && data.full_name.trim().length < 2) {
      throw new ValidationError("El nombre debe tener al menos 2 caracteres")
    }

    return this.repository.update(userId, data)
  }

  /**
   * Delete a user (including auth account)
   * Requires service role client
   */
  async delete(userId: string, requestingUserId: string): Promise<void> {
    // Business rule: Cannot delete yourself
    if (userId === requestingUserId) {
      throw new BusinessLogicError("No puedes eliminar tu propia cuenta")
    }

    // Verify user exists
    const existing = await this.repository.findById(userId)
    if (!existing) {
      throw new ValidationError(`Usuario con ID ${userId} no encontrado`)
    }

    // Delete auth user using service client (profile will be deleted by cascade)
    const { error: deleteError } = await this.serviceClient.auth.admin.deleteUser(userId)

    if (deleteError) {
      throw new ExternalServiceError("Supabase Auth", deleteError.message)
    }
  }

  /**
   * Toggle user active status
   */
  async toggleActive(userId: string, activo: boolean, requestingUserId: string): Promise<Profile> {
    // Business rule: Cannot deactivate yourself
    if (userId === requestingUserId && !activo) {
      throw new BusinessLogicError("No puedes desactivar tu propia cuenta")
    }

    // Verify user exists
    const existing = await this.repository.findById(userId)
    if (!existing) {
      throw new ValidationError(`Usuario con ID ${userId} no encontrado`)
    }

    return this.repository.update(userId, { activo })
  }

  /**
   * Validate user creation data
   */
  private validateUserData(data: CreateUserDTO): void {
    const errors: Record<string, string[]> = {}

    // Validate email
    if (!data.email || !isValidEmail(data.email)) {
      errors.email = ["El email no es válido"]
    }

    // Validate password
    if (!data.password || data.password.length < 6) {
      errors.password = ["La contraseña debe tener al menos 6 caracteres"]
    }

    // Validate full_name
    if (!data.full_name || data.full_name.trim().length < 2) {
      errors.full_name = ["El nombre debe tener al menos 2 caracteres"]
    }

    // Validate role
    if (!data.role || !["admin", "user"].includes(data.role)) {
      errors.role = ["El rol debe ser 'admin' o 'user'"]
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Errores de validación", errors)
    }
  }
}

// Fix import error
import { DatabaseError } from "@/lib/errors/app-errors"

import type { SupabaseClient } from "@supabase/supabase-js"
import { DatabaseError } from "@/lib/errors/app-errors"
import type { Profile } from "@/lib/types"

/**
 * DTO for creating a new profile
 */
export interface CreateProfileDTO {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "user"
  activo?: boolean
}

/**
 * DTO for updating a profile
 */
export interface UpdateProfileDTO {
  full_name?: string
  role?: "admin" | "user"
  activo?: boolean
}

/**
 * Repository for Profile operations
 * Note: Profiles don't use soft delete
 */
export class ProfileRepository {
  constructor(protected supabase: SupabaseClient) {}

  /**
   * Find all profiles
   */
  async findAll(orderBy = "full_name"): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .order(orderBy, { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener usuarios: ${error.message}`, error)
      }

      return (data || []) as Profile[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener usuarios", error)
    }
  }

  /**
   * Find profile by ID
   */
  async findById(id: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al obtener usuario: ${error.message}`, error)
      }

      return data as Profile
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener usuario", error)
    }
  }

  /**
   * Find profile by email
   */
  async findByEmail(email: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al obtener usuario: ${error.message}`, error)
      }

      return data as Profile
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener usuario", error)
    }
  }

  /**
   * Create a new profile
   */
  async create(data: CreateProfileDTO): Promise<Profile> {
    try {
      const { data: created, error } = await this.supabase
        .from("profiles")
        .insert(data)
        .select("*")
        .single()

      if (error) {
        throw new DatabaseError(`Error al crear usuario: ${error.message}`, error)
      }

      if (!created) {
        throw new DatabaseError("No se pudo crear el usuario")
      }

      return created as Profile
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al crear usuario", error)
    }
  }

  /**
   * Update a profile
   */
  async update(id: string, data: UpdateProfileDTO): Promise<Profile> {
    try {
      const { data: updated, error } = await this.supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select("*")
        .single()

      if (error) {
        throw new DatabaseError(`Error al actualizar usuario: ${error.message}`, error)
      }

      if (!updated) {
        throw new DatabaseError("No se pudo actualizar el usuario")
      }

      return updated as Profile
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al actualizar usuario", error)
    }
  }

  /**
   * Find active profiles
   */
  async findActive(): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("activo", true)
        .order("full_name", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener usuarios activos: ${error.message}`, error)
      }

      return (data || []) as Profile[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener usuarios activos", error)
    }
  }

  /**
   * Find profiles by role
   */
  async findByRole(role: "admin" | "user"): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("role", role)
        .order("full_name", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener usuarios: ${error.message}`, error)
      }

      return (data || []) as Profile[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener usuarios", error)
    }
  }
}

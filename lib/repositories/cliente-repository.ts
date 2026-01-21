import type { SupabaseClient } from "@supabase/supabase-js"
import { BaseRepository } from "./base-repository"
import type { Cliente } from "@/lib/types"
import { DatabaseError } from "@/lib/errors/app-errors"

/**
 * DTO for creating a new cliente
 */
export interface CreateClienteDTO {
  nombre: string
  contacto?: string | null
  email?: string | null
  es_menor: boolean
  nombre_responsable?: string | null
  sexo?: "masculino" | "femenino" | "otro" | null
}

/**
 * DTO for updating a cliente
 */
export interface UpdateClienteDTO {
  nombre?: string
  contacto?: string | null
  email?: string | null
  es_menor?: boolean
  nombre_responsable?: string | null
  sexo?: "masculino" | "femenino" | "otro" | null
}

/**
 * Repository for Cliente operations
 */
export class ClienteRepository extends BaseRepository<Cliente, CreateClienteDTO, UpdateClienteDTO> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "clientes")
  }

  /**
   * Search clientes by name, contact, or email
   */
  async search(query: string): Promise<Cliente[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .is("deleted_at", null)
        .or(`nombre.ilike.${searchTerm},contacto.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .order("nombre", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al buscar clientes: ${error.message}`, error)
      }

      return (data || []) as Cliente[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al buscar clientes", error)
    }
  }

  /**
   * Find clientes by es_menor status
   */
  async findByMenorStatus(esMenor: boolean): Promise<Cliente[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .eq("es_menor", esMenor)
        .is("deleted_at", null)
        .order("nombre", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al buscar clientes: ${error.message}`, error)
      }

      return (data || []) as Cliente[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al buscar clientes", error)
    }
  }

  /**
   * Find cliente by contact (phone/whatsapp)
   */
  async findByContact(contact: string): Promise<Cliente | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .eq("contacto", contact)
        .is("deleted_at", null)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al buscar cliente por contacto: ${error.message}`, error)
      }

      return data as Cliente
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al buscar cliente", error)
    }
  }

  /**
   * Count total clientes (non-deleted)
   */
  async count(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null)

      if (error) {
        throw new DatabaseError(`Error al contar clientes: ${error.message}`, error)
      }

      return count || 0
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al contar clientes", error)
    }
  }
}

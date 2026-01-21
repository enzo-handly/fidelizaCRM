import type { SupabaseClient } from "@supabase/supabase-js"
import { BaseRepository } from "./base-repository"
import type { Servicio, Subservicio } from "@/lib/types"
import { DatabaseError } from "@/lib/errors/app-errors"

/**
 * DTO for creating a new servicio
 */
export interface CreateServicioDTO {
  nombre: string
}

/**
 * DTO for updating a servicio
 */
export interface UpdateServicioDTO {
  nombre?: string
}

/**
 * Repository for Servicio operations
 */
export class ServicioRepository extends BaseRepository<Servicio, CreateServicioDTO, UpdateServicioDTO> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "servicios")
  }

  /**
   * Override to prevent soft delete for servicios (no deleted_at column)
   */
  async findAll(orderBy = "nombre"): Promise<Servicio[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .order(orderBy, { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener servicios: ${error.message}`, error)
      }

      return (data || []) as Servicio[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener servicios", error)
    }
  }

  /**
   * Override to prevent soft delete check
   */
  async findById(id: string): Promise<Servicio | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al obtener servicio: ${error.message}`, error)
      }

      return data as Servicio
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener servicio", error)
    }
  }

  /**
   * Get servicio with all its subservicios
   */
  async findByIdWithSubservicios(id: string): Promise<(Servicio & { subservicios: Subservicio[] }) | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          subservicios(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al obtener servicio: ${error.message}`, error)
      }

      return data as Servicio & { subservicios: Subservicio[] }
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener servicio", error)
    }
  }

  /**
   * Find servicio by nombre
   */
  async findByNombre(nombre: string): Promise<Servicio | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .ilike("nombre", nombre)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al buscar servicio: ${error.message}`, error)
      }

      return data as Servicio
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      if ((error as any).code === "PGRST116") return null
      throw new DatabaseError("Error inesperado al buscar servicio", error)
    }
  }

  /**
   * Get all servicios with their subservicios
   */
  async findAllWithSubservicios(): Promise<(Servicio & { subservicios: Subservicio[] })[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          subservicios:subservicios(*)
        `)
        .is("subservicios.deleted_at", null)
        .order("nombre", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener servicios: ${error.message}`, error)
      }

      return (data || []) as (Servicio & { subservicios: Subservicio[] })[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener servicios", error)
    }
  }

  /**
   * Hard delete (servicios don't use soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq("id", id)

      if (error) {
        throw new DatabaseError(`Error al eliminar servicio: ${error.message}`, error)
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al eliminar servicio", error)
    }
  }
}

/**
 * DTO for creating a new subservicio
 */
export interface CreateSubservicioDTO {
  servicio_id: string
  nombre: string
  precio_pyg: number
}

/**
 * DTO for updating a subservicio
 */
export interface UpdateSubservicioDTO {
  nombre?: string
  precio_pyg?: number
}

/**
 * Repository for Subservicio operations
 */
export class SubservicioRepository extends BaseRepository<Subservicio, CreateSubservicioDTO, UpdateSubservicioDTO> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "subservicios")
  }

  /**
   * Override select query to include servicio relation
   */
  protected getSelectQuery(): string {
    return `
      *,
      servicio:servicios(*)
    `
  }

  /**
   * Find all subservicios for a specific servicio
   */
  async findByServicioId(servicioId: string): Promise<Subservicio[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .eq("servicio_id", servicioId)
        .is("deleted_at", null)
        .order("nombre", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener subservicios: ${error.message}`, error)
      }

      return (data || []) as unknown as Subservicio[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener subservicios", error)
    }
  }

  /**
   * Find multiple subservicios by their IDs
   */
  async findByIds(ids: string[]): Promise<Subservicio[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .in("id", ids)
        .is("deleted_at", null)

      if (error) {
        throw new DatabaseError(`Error al obtener subservicios: ${error.message}`, error)
      }

      return (data || []) as unknown as Subservicio[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener subservicios", error)
    }
  }

  /**
   * Find subservicio by nombre and servicio_id
   */
  async findByNombreAndServicio(nombre: string, servicioId: string): Promise<Subservicio | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .ilike("nombre", nombre)
        .eq("servicio_id", servicioId)
        .is("deleted_at", null)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al buscar subservicio: ${error.message}`, error)
      }

      return data as unknown as Subservicio
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      if ((error as any).code === "PGRST116") return null
      throw new DatabaseError("Error inesperado al buscar subservicio", error)
    }
  }
}

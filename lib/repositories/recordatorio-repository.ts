import type { SupabaseClient } from "@supabase/supabase-js"
import { BaseRepository } from "./base-repository"
import type { Recordatorio } from "@/lib/types"
import { DatabaseError } from "@/lib/errors/app-errors"

/**
 * DTO for creating a new recordatorio
 */
export interface CreateRecordatorioDTO {
  cliente_id: string
  plantilla_id: string
  telefono_destino: string
  fecha_hora: string
  estado?: "pendiente" | "enviado" | "fallido"
}

/**
 * DTO for updating a recordatorio
 */
export interface UpdateRecordatorioDTO {
  cliente_id?: string
  plantilla_id?: string
  telefono_destino?: string
  fecha_hora?: string
  estado?: "pendiente" | "enviado" | "fallido"
  waha_payload?: Record<string, unknown> | null
  waha_response?: Record<string, unknown> | null
}

/**
 * Repository for Recordatorio operations
 */
export class RecordatorioRepository extends BaseRepository<Recordatorio, CreateRecordatorioDTO, UpdateRecordatorioDTO> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "recordatorios")
  }

  /**
   * Override select query to include relations
   */
  protected getSelectQuery(): string {
    return `
      *,
      cliente:clientes(*),
      plantilla:plantillas_mensajes(*)
    `
  }

  /**
   * Find recordatorios by estado
   */
  async findByEstado(estado: "pendiente" | "enviado" | "fallido"): Promise<Recordatorio[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .eq("estado", estado)
        .is("deleted_at", null)
        .order("fecha_hora", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener recordatorios: ${error.message}`, error)
      }

      return (data || []) as unknown as Recordatorio[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener recordatorios", error)
    }
  }

  /**
   * Find recordatorios for a specific cliente
   */
  async findByClienteId(clienteId: string): Promise<Recordatorio[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .eq("cliente_id", clienteId)
        .is("deleted_at", null)
        .order("fecha_hora", { ascending: false })

      if (error) {
        throw new DatabaseError(`Error al obtener recordatorios: ${error.message}`, error)
      }

      return (data || []) as unknown as Recordatorio[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener recordatorios", error)
    }
  }

  /**
   * Find pending recordatorios scheduled before a certain date
   */
  async findPendingBefore(beforeDate: Date): Promise<Recordatorio[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .eq("estado", "pendiente")
        .lte("fecha_hora", beforeDate.toISOString())
        .is("deleted_at", null)
        .order("fecha_hora", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener recordatorios: ${error.message}`, error)
      }

      return (data || []) as unknown as Recordatorio[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener recordatorios", error)
    }
  }

  /**
   * Count recordatorios by estado
   */
  async countByEstado(estado: "pendiente" | "enviado" | "fallido"): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select("*", { count: "exact", head: true })
        .eq("estado", estado)
        .is("deleted_at", null)

      if (error) {
        throw new DatabaseError(`Error al contar recordatorios: ${error.message}`, error)
      }

      return count || 0
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al contar recordatorios", error)
    }
  }
}

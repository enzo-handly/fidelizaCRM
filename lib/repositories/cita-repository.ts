import type { SupabaseClient } from "@supabase/supabase-js"
import { DatabaseError } from "@/lib/errors/app-errors"
import type { Cita, CitaSubservicio } from "@/lib/types"

/**
 * DTO for creating a new cita
 */
export interface CreateCitaDTO {
  cliente_id: string
  fecha_hora: string
  monto_total_pyg: number
  notas?: string | null
  enviar_recordatorio?: boolean
  recordatorio_id?: string | null
  fue_cancelado?: boolean
}

/**
 * DTO for updating a cita
 */
export interface UpdateCitaDTO {
  cliente_id?: string
  fecha_hora?: string
  monto_total_pyg?: number
  notas?: string | null
  fue_cancelado?: boolean
  recordatorio_id?: string | null
}

/**
 * Repository for Cita operations
 * Note: Citas have a more complex structure with subservicios junction table
 */
export class CitaRepository {
  constructor(protected supabase: SupabaseClient) {}

  /**
   * Find all citas with relations
   */
  async findAll(): Promise<Cita[]> {
    try {
      const { data, error } = await this.supabase
        .from("citas")
        .select(`
          *,
          cliente:clientes(*),
          subservicios:citas_subservicios(
            *,
            subservicio:subservicios(*)
          ),
          recordatorio:recordatorios(*)
        `)
        .order("fecha_hora", { ascending: false })

      if (error) {
        throw new DatabaseError(`Error al obtener citas: ${error.message}`, error)
      }

      return (data || []) as Cita[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener citas", error)
    }
  }

  /**
   * Find cita by ID with relations
   */
  async findById(id: string): Promise<Cita | null> {
    try {
      const { data, error } = await this.supabase
        .from("citas")
        .select(`
          *,
          cliente:clientes(*),
          subservicios:citas_subservicios(
            *,
            subservicio:subservicios(*)
          ),
          recordatorio:recordatorios(*)
        `)
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          return null
        }
        throw new DatabaseError(`Error al obtener cita: ${error.message}`, error)
      }

      return data as Cita
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener cita", error)
    }
  }

  /**
   * Create a new cita
   */
  async create(data: CreateCitaDTO): Promise<Cita> {
    try {
      const { data: created, error } = await this.supabase
        .from("citas")
        .insert(data)
        .select(`
          *,
          cliente:clientes(*)
        `)
        .single()

      if (error) {
        throw new DatabaseError(`Error al crear cita: ${error.message}`, error)
      }

      if (!created) {
        throw new DatabaseError("No se pudo crear la cita")
      }

      return created as Cita
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al crear cita", error)
    }
  }

  /**
   * Update a cita
   */
  async update(id: string, data: UpdateCitaDTO): Promise<Cita> {
    try {
      const { data: updated, error } = await this.supabase
        .from("citas")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select(`
          *,
          cliente:clientes(*),
          subservicios:citas_subservicios(
            *,
            subservicio:subservicios(*)
          )
        `)
        .single()

      if (error) {
        throw new DatabaseError(`Error al actualizar cita: ${error.message}`, error)
      }

      if (!updated) {
        throw new DatabaseError("No se pudo actualizar la cita")
      }

      return updated as Cita
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al actualizar cita", error)
    }
  }

  /**
   * Find citas by cliente ID
   */
  async findByClienteId(clienteId: string): Promise<Cita[]> {
    try {
      const { data, error } = await this.supabase
        .from("citas")
        .select(`
          *,
          cliente:clientes(*),
          subservicios:citas_subservicios(
            *,
            subservicio:subservicios(*)
          )
        `)
        .eq("cliente_id", clienteId)
        .order("fecha_hora", { ascending: false })

      if (error) {
        throw new DatabaseError(`Error al obtener citas: ${error.message}`, error)
      }

      return (data || []) as Cita[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener citas", error)
    }
  }

  /**
   * Find citas by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Cita[]> {
    try {
      const { data, error } = await this.supabase
        .from("citas")
        .select(`
          *,
          cliente:clientes(*),
          subservicios:citas_subservicios(
            *,
            subservicio:subservicios(*)
          )
        `)
        .gte("fecha_hora", startDate.toISOString())
        .lte("fecha_hora", endDate.toISOString())
        .order("fecha_hora", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener citas: ${error.message}`, error)
      }

      return (data || []) as Cita[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener citas", error)
    }
  }

  /**
   * Count citas for a specific date
   */
  async countByDate(date: Date): Promise<number> {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const { count, error } = await this.supabase
        .from("citas")
        .select("*", { count: "exact", head: true })
        .gte("fecha_hora", startOfDay.toISOString())
        .lte("fecha_hora", endOfDay.toISOString())

      if (error) {
        throw new DatabaseError(`Error al contar citas: ${error.message}`, error)
      }

      return count || 0
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al contar citas", error)
    }
  }

  /**
   * Create cita-subservicio junction records
   */
  async createCitaSubservicios(
    citaId: string,
    subservicioIds: string[],
    precios: Map<string, number>
  ): Promise<void> {
    try {
      const junctionData = subservicioIds.map(subservicioId => ({
        cita_id: citaId,
        subservicio_id: subservicioId,
        precio_pyg: precios.get(subservicioId) || 0
      }))

      const { error } = await this.supabase
        .from("citas_subservicios")
        .insert(junctionData)

      if (error) {
        throw new DatabaseError(`Error al crear relación cita-subservicios: ${error.message}`, error)
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al crear relación cita-subservicios", error)
    }
  }

  /**
   * Delete cita-subservicio junction records for a cita
   */
  async deleteCitaSubservicios(citaId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("citas_subservicios")
        .delete()
        .eq("cita_id", citaId)

      if (error) {
        throw new DatabaseError(`Error al eliminar relación cita-subservicios: ${error.message}`, error)
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al eliminar relación cita-subservicios", error)
    }
  }
}

import type { SupabaseClient } from "@supabase/supabase-js"
import { BaseRepository } from "./base-repository"
import type { PlantillaMensaje } from "@/lib/types"
import { DatabaseError } from "@/lib/errors/app-errors"

/**
 * DTO for creating a new plantilla
 */
export interface CreatePlantillaDTO {
  titulo: string
  cuerpo: string
  adjunto_url?: string | null
  adjunto_nombre?: string | null
}

/**
 * DTO for updating a plantilla
 */
export interface UpdatePlantillaDTO {
  titulo?: string
  cuerpo?: string
  adjunto_url?: string | null
  adjunto_nombre?: string | null
}

/**
 * Repository for PlantillaMensaje operations
 */
export class PlantillaRepository extends BaseRepository<PlantillaMensaje, CreatePlantillaDTO, UpdatePlantillaDTO> {
  constructor(supabase: SupabaseClient) {
    super(supabase, "plantillas_mensajes")
  }

  /**
   * Search plantillas by title or content
   */
  async search(query: string): Promise<PlantillaMensaje[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .is("deleted_at", null)
        .or(`titulo.ilike.${searchTerm},cuerpo.ilike.${searchTerm}`)
        .order("titulo", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al buscar plantillas: ${error.message}`, error)
      }

      return (data || []) as PlantillaMensaje[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al buscar plantillas", error)
    }
  }

  /**
   * Find plantillas with attachments
   */
  async findWithAttachments(): Promise<PlantillaMensaje[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select("*")
        .not("adjunto_url", "is", null)
        .is("deleted_at", null)
        .order("titulo", { ascending: true })

      if (error) {
        throw new DatabaseError(`Error al obtener plantillas: ${error.message}`, error)
      }

      return (data || []) as PlantillaMensaje[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError("Error inesperado al obtener plantillas", error)
    }
  }
}

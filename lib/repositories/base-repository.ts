import type { SupabaseClient } from "@supabase/supabase-js"
import { DatabaseError, NotFoundError } from "@/lib/errors/app-errors"

/**
 * Base repository interface
 * All repositories should implement this interface
 */
export interface IRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  findAll(): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDTO): Promise<T>
  update(id: string, data: UpdateDTO): Promise<T>
  delete(id: string): Promise<void>
}

/**
 * Base repository class with common CRUD operations
 * Implements soft delete pattern
 */
export abstract class BaseRepository<T extends { id: string }, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> 
  implements IRepository<T, CreateDTO, UpdateDTO> {
  
  constructor(
    protected supabase: SupabaseClient,
    protected tableName: string
  ) {}

  /**
   * Find all non-deleted records
   */
  async findAll(orderBy?: string): Promise<T[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .is("deleted_at", null)

      if (orderBy) {
        query = query.order(orderBy, { ascending: true })
      }

      const { data, error } = await query

      if (error) {
        throw new DatabaseError(`Error al obtener ${this.tableName}: ${error.message}`, error)
      }

      return (data || []) as unknown as T[]
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError(`Error inesperado al obtener ${this.tableName}`, error)
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(this.getSelectQuery())
        .eq("id", id)
        .is("deleted_at", null)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return null
        }
        throw new DatabaseError(`Error al obtener ${this.tableName}: ${error.message}`, error)
      }

      return data as unknown as T
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError(`Error inesperado al obtener ${this.tableName}`, error)
    }
  }

  /**
   * Create a new record
   */
  async create(data: CreateDTO): Promise<T> {
    try {
      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(data as never)
        .select(this.getSelectQuery())
        .single()

      if (error) {
        throw new DatabaseError(`Error al crear ${this.tableName}: ${error.message}`, error)
      }

      if (!created) {
        throw new DatabaseError(`No se pudo crear ${this.tableName}`)
      }

      return created as unknown as T
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError(`Error inesperado al crear ${this.tableName}`, error)
    }
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update({
          ...(data as Record<string, unknown>),
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .is("deleted_at", null)
        .select(this.getSelectQuery())
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          throw new NotFoundError(this.tableName, id)
        }
        throw new DatabaseError(`Error al actualizar ${this.tableName}: ${error.message}`, error)
      }

      if (!updated) {
        throw new NotFoundError(this.tableName, id)
      }

      return updated as unknown as T
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError) throw error
      throw new DatabaseError(`Error inesperado al actualizar ${this.tableName}`, error)
    }
  }

  /**
   * Soft delete a record
   */
  async delete(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq("id", id)
        .is("deleted_at", null)

      if (error) {
        throw new DatabaseError(`Error al eliminar ${this.tableName}: ${error.message}`, error)
      }
    } catch (error) {
      if (error instanceof DatabaseError) throw error
      throw new DatabaseError(`Error inesperado al eliminar ${this.tableName}`, error)
    }
  }

  /**
   * Override this method to customize the SELECT query
   * Default: select all columns (*)
   */
  protected getSelectQuery(): string {
    return "*"
  }
}

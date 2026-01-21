import type { ClienteRepository, CreateClienteDTO, UpdateClienteDTO } from "@/lib/repositories/cliente-repository"
import type { Cliente } from "@/lib/types"
import { ValidationError, BusinessLogicError } from "@/lib/errors/app-errors"

/**
 * Service for Cliente business logic
 */
export class ClienteService {
  constructor(private repository: ClienteRepository) {}

  /**
   * Get all clientes
   */
  async getAll(): Promise<Cliente[]> {
    return this.repository.findAll("nombre")
  }

  /**
   * Get cliente by ID
   */
  async getById(id: string): Promise<Cliente | null> {
    return this.repository.findById(id)
  }

  /**
   * Search clientes
   */
  async search(query: string): Promise<Cliente[]> {
    if (!query || query.trim().length === 0) {
      return this.getAll()
    }
    return this.repository.search(query.trim())
  }

  /**
   * Create a new cliente with validation
   */
  async create(data: CreateClienteDTO): Promise<Cliente> {
    // Validate input
    this.validateClienteData(data)

    // Business rule: If es_menor is true, nombre_responsable is required
    if (data.es_menor && !data.nombre_responsable?.trim()) {
      throw new ValidationError(
        "El nombre del responsable es obligatorio para menores de edad"
      )
    }

    // Business rule: Check for duplicate contact if provided
    if (data.contacto) {
      const existing = await this.repository.findByContact(data.contacto)
      if (existing) {
        throw new BusinessLogicError(
          `Ya existe un cliente con el contacto ${data.contacto}`
        )
      }
    }

    return this.repository.create(data)
  }

  /**
   * Update an existing cliente
   */
  async update(id: string, data: UpdateClienteDTO): Promise<Cliente> {
    // Validate input if provided
    if (data.nombre !== undefined || data.contacto !== undefined || data.email !== undefined) {
      this.validateClienteData(data as CreateClienteDTO, true)
    }

    // Get existing cliente
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new ValidationError(`Cliente con ID ${id} no encontrado`)
    }

    // Business rule: If changing to es_menor, nombre_responsable is required
    if (data.es_menor === true && !data.nombre_responsable && !existing.nombre_responsable) {
      throw new ValidationError(
        "El nombre del responsable es obligatorio para menores de edad"
      )
    }

    // Business rule: If changing to NOT es_menor, clear nombre_responsable
    if (data.es_menor === false) {
      data.nombre_responsable = null
    }

    // Business rule: Check for duplicate contact if changing
    if (data.contacto && data.contacto !== existing.contacto) {
      const duplicate = await this.repository.findByContact(data.contacto)
      if (duplicate && duplicate.id !== id) {
        throw new BusinessLogicError(
          `Ya existe otro cliente con el contacto ${data.contacto}`
        )
      }
    }

    return this.repository.update(id, data)
  }

  /**
   * Delete a cliente (soft delete)
   */
  async delete(id: string): Promise<void> {
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new ValidationError(`Cliente con ID ${id} no encontrado`)
    }

    await this.repository.delete(id)
  }

  /**
   * Get total count of clientes
   */
  async count(): Promise<number> {
    return this.repository.count()
  }

  /**
   * Get clientes by menor status
   */
  async getByMenorStatus(esMenor: boolean): Promise<Cliente[]> {
    return this.repository.findByMenorStatus(esMenor)
  }

  /**
   * Validate cliente data
   */
  private validateClienteData(data: CreateClienteDTO, isUpdate = false): void {
    const errors: Record<string, string[]> = {}

    // Validate nombre
    if (!isUpdate || data.nombre !== undefined) {
      if (!data.nombre || data.nombre.trim().length === 0) {
        errors.nombre = ["El nombre es obligatorio"]
      } else if (data.nombre.trim().length < 2) {
        errors.nombre = ["El nombre debe tener al menos 2 caracteres"]
      } else if (data.nombre.trim().length > 200) {
        errors.nombre = ["El nombre no puede exceder 200 caracteres"]
      }
    }

    // Validate email format if provided
    if (data.email && data.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        errors.email = ["El formato del email no es válido"]
      }
    }

    // Validate contacto format if provided
    if (data.contacto && data.contacto.trim().length > 0) {
      // Basic validation - could be enhanced with specific phone format
      if (data.contacto.trim().length < 6) {
        errors.contacto = ["El contacto debe tener al menos 6 caracteres"]
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Errores de validación", errors)
    }
  }
}

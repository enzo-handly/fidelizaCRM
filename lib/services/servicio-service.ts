import { ServicioRepository, SubservicioRepository } from "../repositories/servicio-repository";
import { ValidationError, BusinessLogicError, NotFoundError } from "../errors/app-errors";
import type { Servicio, Subservicio } from "../types";

export interface CreateSubservicioDTO {
  servicio_id: string;
  nombre: string;
  precio_pyg: number;
}

export interface UpdateSubservicioDTO {
  servicio_id?: string;
  nombre?: string;
  precio_pyg?: number;
}

/**
 * Service for managing Servicios
 */
export class ServicioService {
  constructor(private servicioRepository: ServicioRepository) {}

  /**
   * Validates servicio data
   */
  private validateServicioData(nombre: string): void {
    if (!nombre || nombre.trim().length === 0) {
      throw new ValidationError("El nombre del servicio es requerido");
    }

    if (nombre.length > 100) {
      throw new ValidationError("El nombre del servicio no puede exceder 100 caracteres");
    }
  }

  /**
   * Get all servicios
   */
  async findAll(): Promise<Servicio[]> {
    return this.servicioRepository.findAll();
  }

  /**
   * Get a servicio by ID
   */
  async findById(id: string): Promise<Servicio | null> {
    return this.servicioRepository.findById(id);
  }

  /**
   * Create a new servicio
   */
  async create(nombre: string): Promise<Servicio> {
    this.validateServicioData(nombre);

    // Check for duplicate nombre
    const existing = await this.servicioRepository.findByNombre(nombre);
    if (existing) {
      throw new BusinessLogicError("Ya existe un servicio con ese nombre");
    }

    return this.servicioRepository.create({ nombre });
  }

  /**
   * Update a servicio
   */
  async update(id: string, nombre: string): Promise<Servicio> {
    this.validateServicioData(nombre);

    const existing = await this.servicioRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Servicio no encontrado");
    }

    // Check for duplicate nombre (excluding current servicio)
    const duplicate = await this.servicioRepository.findByNombre(nombre);
    if (duplicate && duplicate.id !== id) {
      throw new BusinessLogicError("Ya existe un servicio con ese nombre");
    }

    return this.servicioRepository.update(id, { nombre }) as Promise<Servicio>;
  }

  /**
   * Delete a servicio (soft delete)
   * Note: This should check if there are active subservicios first
   */
  async delete(id: string): Promise<void> {
    const servicio = await this.servicioRepository.findById(id);
    if (!servicio) {
      throw new NotFoundError("Servicio no encontrado");
    }

    // TODO: Check if there are active subservicios
    // For now, we'll allow deletion
    await this.servicioRepository.delete(id);
  }
}

/**
 * Service for managing Subservicios
 */
export class SubservicioService {
  constructor(
    private subservicioRepository: SubservicioRepository,
    private servicioRepository: ServicioRepository
  ) {}

  /**
   * Validates subservicio data
   */
  private async validateSubservicioData(data: CreateSubservicioDTO | UpdateSubservicioDTO): Promise<void> {
    // Validate servicio_id exists
    if (data.servicio_id) {
      const servicio = await this.servicioRepository.findById(data.servicio_id);
      if (!servicio) {
        throw new NotFoundError("Servicio no encontrado");
      }
    }

    // Validate nombre
    if (data.nombre !== undefined) {
      if (!data.nombre || data.nombre.trim().length === 0) {
        throw new ValidationError("El nombre del subservicio es requerido");
      }

      if (data.nombre.length > 100) {
        throw new ValidationError("El nombre del subservicio no puede exceder 100 caracteres");
      }
    }

    // Validate precio_pyg
    if (data.precio_pyg !== undefined) {
      if (data.precio_pyg < 0) {
        throw new ValidationError("El precio no puede ser negativo");
      }

      if (data.precio_pyg > 999999999) {
        throw new ValidationError("El precio excede el límite permitido");
      }
    }
  }

  /**
   * Get all subservicios
   */
  async findAll(): Promise<Subservicio[]> {
    return this.subservicioRepository.findAll();
  }

  /**
   * Get subservicios by servicio ID
   */
  async findByServicio(servicioId: string): Promise<Subservicio[]> {
    return this.subservicioRepository.findByServicioId(servicioId);
  }

  /**
   * Get a subservicio by ID
   */
  async findById(id: string): Promise<Subservicio | null> {
    return this.subservicioRepository.findById(id);
  }

  /**
   * Get multiple subservicios by IDs
   */
  async findByIds(ids: string[]): Promise<Subservicio[]> {
    return this.subservicioRepository.findByIds(ids);
  }

  /**
   * Create a new subservicio
   */
  async create(data: CreateSubservicioDTO): Promise<Subservicio> {
    await this.validateSubservicioData(data);

    // Check for duplicate nombre within the same servicio
    const existing = await this.subservicioRepository.findByNombreAndServicio(
      data.nombre,
      data.servicio_id
    );
    if (existing) {
      throw new BusinessLogicError("Ya existe un subservicio con ese nombre en este servicio");
    }

    return this.subservicioRepository.create(data);
  }

  /**
   * Update a subservicio
   */
  async update(id: string, data: UpdateSubservicioDTO): Promise<Subservicio> {
    await this.validateSubservicioData(data);

    const existing = await this.subservicioRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Subservicio no encontrado");
    }

    // Check for duplicate nombre if being updated
    if (data.nombre && data.servicio_id) {
      const duplicate = await this.subservicioRepository.findByNombreAndServicio(
        data.nombre,
        data.servicio_id
      );
      if (duplicate && duplicate.id !== id) {
        throw new BusinessLogicError("Ya existe un subservicio con ese nombre en este servicio");
      }
    }

    return this.subservicioRepository.update(id, data) as Promise<Subservicio>;
  }

  /**
   * Delete a subservicio (soft delete)
   * Note: This should check if there are active citas first
   */
  async delete(id: string): Promise<void> {
    const subservicio = await this.subservicioRepository.findById(id);
    if (!subservicio) {
      throw new NotFoundError("Subservicio no encontrado");
    }

    // TODO: Check if there are active citas using this subservicio
    // For now, we'll allow deletion
    await this.subservicioRepository.delete(id);
  }
}

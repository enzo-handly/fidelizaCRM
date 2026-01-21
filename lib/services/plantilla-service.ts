import { PlantillaRepository } from "../repositories/plantilla-repository";
import { ValidationError, NotFoundError } from "../errors/app-errors";
import type { PlantillaMensaje } from "../types";

export interface CreatePlantillaDTO {
  titulo: string;
  cuerpo: string;
  adjunto_url?: string;
  adjunto_nombre?: string;
}

export interface UpdatePlantillaDTO {
  titulo?: string;
  cuerpo?: string;
  adjunto_url?: string | null;
  adjunto_nombre?: string | null;
}

/**
 * Service for managing Plantillas (message templates)
 */
export class PlantillaService {
  constructor(private plantillaRepository: PlantillaRepository) {}

  /**
   * Validates plantilla data
   */
  private validatePlantillaData(data: CreatePlantillaDTO | UpdatePlantillaDTO): void {
    // Validate titulo
    if (data.titulo !== undefined) {
      if (!data.titulo || data.titulo.trim().length === 0) {
        throw new ValidationError("El título de la plantilla es requerido");
      }

      if (data.titulo.length > 200) {
        throw new ValidationError("El título no puede exceder 200 caracteres");
      }
    }

    // Validate cuerpo
    if (data.cuerpo !== undefined) {
      if (!data.cuerpo || data.cuerpo.trim().length === 0) {
        throw new ValidationError("El cuerpo de la plantilla es requerido");
      }

      if (data.cuerpo.length > 5000) {
        throw new ValidationError("El cuerpo no puede exceder 5000 caracteres");
      }
    }

    // Validate attachment URL format if provided
    if (data.adjunto_url && data.adjunto_url.trim().length > 0) {
      try {
        new URL(data.adjunto_url);
      } catch {
        throw new ValidationError("El URL del adjunto no es válido");
      }
    }
  }

  /**
   * Get all plantillas
   */
  async findAll(): Promise<PlantillaMensaje[]> {
    return this.plantillaRepository.findAll();
  }

  /**
   * Search plantillas by query
   */
  async search(query: string): Promise<PlantillaMensaje[]> {
    return this.plantillaRepository.search(query);
  }

  /**
   * Get a plantilla by ID
   */
  async findById(id: string): Promise<PlantillaMensaje | null> {
    return this.plantillaRepository.findById(id);
  }

  /**
   * Create a new plantilla
   */
  async create(data: CreatePlantillaDTO): Promise<PlantillaMensaje> {
    this.validatePlantillaData(data);

    return this.plantillaRepository.create({
      titulo: data.titulo,
      cuerpo: data.cuerpo,
      adjunto_url: data.adjunto_url || null,
      adjunto_nombre: data.adjunto_nombre || null,
    });
  }

  /**
   * Update a plantilla
   */
  async update(id: string, data: UpdatePlantillaDTO): Promise<PlantillaMensaje> {
    this.validatePlantillaData(data);

    const existing = await this.plantillaRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Plantilla no encontrada");
    }

    return this.plantillaRepository.update(id, data) as Promise<PlantillaMensaje>;
  }

  /**
   * Delete a plantilla (soft delete)
   */
  async delete(id: string): Promise<void> {
    const plantilla = await this.plantillaRepository.findById(id);
    if (!plantilla) {
      throw new NotFoundError("Plantilla no encontrada");
    }

    await this.plantillaRepository.delete(id);
  }

  /**
   * Duplicate a plantilla
   */
  async duplicate(id: string): Promise<PlantillaMensaje> {
    const original = await this.plantillaRepository.findById(id);
    if (!original) {
      throw new NotFoundError("Plantilla no encontrada");
    }

    return this.plantillaRepository.create({
      titulo: `${original.titulo} (Copia)`,
      cuerpo: original.cuerpo,
      adjunto_url: original.adjunto_url,
      adjunto_nombre: original.adjunto_nombre,
    });
  }
}

import { RecordatorioRepository } from "../repositories/recordatorio-repository";
import { ClienteRepository } from "../repositories/cliente-repository";
import { PlantillaRepository } from "../repositories/plantilla-repository";
import { ValidationError, NotFoundError } from "../errors/app-errors";
import type { Recordatorio } from "../types";

export interface CreateRecordatorioDTO {
  cliente_id: string;
  plantilla_id: string;
  telefono_destino: string;
  fecha_hora: string;
  estado?: "pendiente" | "enviado" | "fallido";
}

export interface UpdateRecordatorioDTO {
  cliente_id?: string;
  plantilla_id?: string;
  telefono_destino?: string;
  fecha_hora?: string;
  estado?: "pendiente" | "enviado" | "fallido";
  waha_payload?: Record<string, unknown>;
  waha_response?: Record<string, unknown>;
}

/**
 * Service for managing Recordatorios (reminders)
 */
export class RecordatorioService {
  constructor(
    private recordatorioRepository: RecordatorioRepository,
    private clienteRepository?: ClienteRepository,
    private plantillaRepository?: PlantillaRepository
  ) {}

  /**
   * Validates recordatorio data
   */
  private async validateRecordatorioData(data: CreateRecordatorioDTO | UpdateRecordatorioDTO): Promise<void> {
    // Validate cliente if provided
    if (data.cliente_id && this.clienteRepository) {
      const cliente = await this.clienteRepository.findById(data.cliente_id);
      if (!cliente) {
        throw new NotFoundError("Cliente no encontrado");
      }
    }

    // Validate destinatario (phone number)
    if (data.destinatario !== undefined) {
      if (!data.destinatario || data.destinatario.trim().length === 0) {
        throw new ValidationError("El destinatario es requerido");
      }

      // Basic phone validation (could be improved)
      const phonePattern = /^[+]?[0-9\s()-]{8,20}$/;
      if (!phonePattern.test(data.destinatario)) {
        throw new ValidationError("El formato del teléfono no es válido");
      }
    }

    // Validate fecha_envio
    if (data.fecha_envio !== undefined) {
      const fecha = new Date(data.fecha_envio);
      if (isNaN(fecha.getTime())) {
        throw new ValidationError("Formato de fecha inválido");
      }
    }

    // Validate estado
    if (data.estado !== undefined) {
      const validEstados = ["pendiente", "enviado", "fallido"];
      if (!validEstados.includes(data.estado)) {
        throw new ValidationError("Estado inválido");
      }
    }
  }

  /**
   * Get all recordatorios
   */
  async findAll(): Promise<Recordatorio[]> {
    return this.recordatorioRepository.findAll();
  }

  /**
   * Get recordatorios by estado
   */
  async findByEstado(estado: "pendiente" | "enviado" | "fallido"): Promise<Recordatorio[]> {
    return this.recordatorioRepository.findByEstado(estado);
  }

  /**
   * Get pending recordatorios before a specific date
   */
  async findPendingBefore(fecha: Date): Promise<Recordatorio[]> {
    return this.recordatorioRepository.findPendingBefore(fecha);
  }

  /**
   * Get a recordatorio by ID
   */
  async findById(id: string): Promise<Recordatorio | null> {
    return this.recordatorioRepository.findById(id);
  }

  /**
   * Create a new recordatorio
   */
  async create(data: CreateRecordatorioDTO): Promise<Recordatorio> {
    await this.validateRecordatorioData(data);

    return this.recordatorioRepository.create({
      cita_id: data.cita_id,
      cliente_id: data.cliente_id,
      destinatario: data.destinatario,
      fecha_envio: data.fecha_envio,
      estado: data.estado || "pendiente",
      tipo: data.tipo || "manual",
    });
  }

  /**
   * Update a recordatorio
   */
  async update(id: string, data: UpdateRecordatorioDTO): Promise<Recordatorio> {
    await this.validateRecordatorioData(data);

    const existing = await this.recordatorioRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Recordatorio no encontrado");
    }

    return this.recordatorioRepository.update(id, data) as Promise<Recordatorio>;
  }

  /**
   * Update recordatorio status
   */
  async updateEstado(
    id: string,
    estado: "pendiente" | "enviado" | "fallido",
    wahaPayload?: Record<string, unknown>,
    wahaResponse?: Record<string, unknown>
  ): Promise<Recordatorio> {
    const existing = await this.recordatorioRepository.findById(id);
    if (!existing) {
      throw new NotFoundError("Recordatorio no encontrado");
    }

    const updateData: UpdateRecordatorioDTO = { estado };
    if (wahaPayload) updateData.waha_payload = wahaPayload;
    if (wahaResponse) updateData.waha_response = wahaResponse;

    return this.recordatorioRepository.update(id, updateData) as Promise<Recordatorio>;
  }

  /**
   * Delete a recordatorio (soft delete)
   */
  async delete(id: string): Promise<void> {
    const recordatorio = await this.recordatorioRepository.findById(id);
    if (!recordatorio) {
      throw new NotFoundError("Recordatorio no encontrado");
    }

    await this.recordatorioRepository.delete(id);
  }

  /**
   * Get recordatorios that need to be sent now
   */
  async getPendingToSend(): Promise<Recordatorio[]> {
    const now = new Date();
    return this.recordatorioRepository.findPendingBefore(now);
  }
}

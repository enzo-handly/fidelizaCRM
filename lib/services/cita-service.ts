import { CitaRepository } from "../repositories/cita-repository";
import { SubservicioRepository } from "../repositories/servicio-repository";
import { RecordatorioRepository } from "../repositories/recordatorio-repository";
import { ClienteRepository } from "../repositories/cliente-repository";
import { ValidationError, BusinessLogicError, NotFoundError } from "../errors/app-errors";
import type { Cita, Subservicio, Cliente } from "../types";

export interface CreateCitaDTO {
  cliente_id: string;
  subservicio_ids: string[];
  fecha_hora: string;
  notas?: string;
  enviar_recordatorio?: boolean;
  recordatorio_antes_minutos?: number;
}

export interface UpdateCitaDTO {
  cliente_id?: string;
  subservicio_ids?: string[];
  fecha_hora?: string;
  notas?: string;
  fue_cancelado?: boolean;
}

export class CitaService {
  constructor(
    private citaRepository: CitaRepository,
    private subservicioRepository: SubservicioRepository,
    private recordatorioRepository: RecordatorioRepository,
    private clienteRepository: ClienteRepository
  ) {}

  /**
   * Validates cita data before creating or updating
   */
  private async validateCitaData(data: CreateCitaDTO | UpdateCitaDTO): Promise<void> {
    // Validate cliente exists
    if (data.cliente_id) {
      const cliente = await this.clienteRepository.findById(data.cliente_id);
      if (!cliente) {
        throw new NotFoundError("Cliente no encontrado");
      }
    }

    // Validate subservicios exist
    if (data.subservicio_ids && data.subservicio_ids.length > 0) {
      const subservicios = await this.subservicioRepository.findByIds(data.subservicio_ids);
      if (subservicios.length !== data.subservicio_ids.length) {
        throw new ValidationError("Uno o más subservicios no existen");
      }
    } else if ("subservicio_ids" in data) {
      // For create, subservicio_ids is required
      throw new ValidationError("Debe seleccionar al menos un subservicio");
    }

    // Validate fecha_hora format and not in the past
    if (data.fecha_hora) {
      const fechaCita = new Date(data.fecha_hora);
      if (isNaN(fechaCita.getTime())) {
        throw new ValidationError("Formato de fecha inválido");
      }
      // Allow past dates for historical records
    }
  }

  /**
   * Calculates the total amount from subservicios
   */
  private calculateTotal(subservicios: Subservicio[]): number {
    return subservicios.reduce((sum, subservicio) => sum + (subservicio.precio_pyg || 0), 0);
  }

  /**
   * Creates a price map for junction table
   */
  private createPriceMap(subservicios: Subservicio[]): Map<string, number> {
    const priceMap = new Map<string, number>();
    subservicios.forEach((s) => {
      priceMap.set(s.id, s.precio_pyg || 0);
    });
    return priceMap;
  }

  /**
   * Creates a recordatorio for the cita
   */
  private async createRecordatorio(
    citaId: string,
    clienteId: string,
    fechaCita: Date,
    minutesBefore: number = 60
  ): Promise<void> {
    // Get cliente contact info
    const cliente = await this.clienteRepository.findById(clienteId);
    if (!cliente || !cliente.contacto) {
      throw new BusinessLogicError("Cliente no tiene información de contacto para enviar recordatorio");
    }

    // Calculate fecha_envio
    const fechaEnvio = new Date(fechaCita);
    fechaEnvio.setMinutes(fechaEnvio.getMinutes() - minutesBefore);

    // Create recordatorio
    await this.recordatorioRepository.create({
      cita_id: citaId,
      destinatario: cliente.contacto,
      fecha_envio: fechaEnvio.toISOString(),
      estado: "pendiente",
      tipo: "cita",
    });
  }

  /**
   * Get all citas with subservicios and clientes
   */
  async findAll(): Promise<Cita[]> {
    return this.citaRepository.findAll();
  }

  /**
   * Get citas for a specific date range
   */
  async findByDateRange(startDate: string, endDate: string): Promise<Cita[]> {
    return this.citaRepository.findByDateRange(new Date(startDate), new Date(endDate));
  }

  /**
   * Get a single cita by ID
   */
  async findById(id: string): Promise<Cita | null> {
    return this.citaRepository.findById(id);
  }

  /**
   * Create a new cita with complex transaction handling
   * This includes:
   * 1. Creating the cita record
   * 2. Creating junction table entries (citas_subservicios)
   * 3. Optionally creating a recordatorio
   * 
   * If any step fails, the cita is marked as cancelled for rollback
   */
  async create(data: CreateCitaDTO): Promise<Cita> {
    // Validate all data
    await this.validateCitaData(data);

    // Get subservicios with prices
    const subservicios = await this.subservicioRepository.findByIds(data.subservicio_ids);
    
    // Calculate total
    const monto_total_pyg = this.calculateTotal(subservicios);

    // Create the cita
    const cita = await this.citaRepository.create({
      cliente_id: data.cliente_id,
      fecha_hora: data.fecha_hora,
      monto_total_pyg,
      notas: data.notas,
      fue_cancelado: false,
    });

    try {
      // Create junction table entries with prices
      const priceMap = this.createPriceMap(subservicios);
      await this.citaRepository.createCitaSubservicios(
        cita.id,
        data.subservicio_ids,
        priceMap
      );

      // Create recordatorio if requested
      if (data.enviar_recordatorio) {
        const minutesBefore = data.recordatorio_antes_minutos || 60;
        await this.createRecordatorio(
          cita.id,
          data.cliente_id,
          new Date(data.fecha_hora),
          minutesBefore
        );
      }

      // Return the complete cita
      return this.citaRepository.findById(cita.id) as Promise<Cita>;
    } catch (error) {
      // Rollback by marking cita as cancelled
      await this.citaRepository.update(cita.id, { fue_cancelado: true });
      throw error;
    }
  }

  /**
   * Update an existing cita
   * This involves:
   * 1. Updating the cita record
   * 2. If subservicios changed, delete and recreate junction entries
   */
  async update(id: string, data: UpdateCitaDTO): Promise<Cita> {
    // Check if cita exists
    const existingCita = await this.citaRepository.findById(id);
    if (!existingCita) {
      throw new NotFoundError("Cita no encontrada");
    }

    // Validate update data
    await this.validateCitaData(data);

    // Prepare update data
    const updateData: any = {};
    
    if (data.cliente_id) updateData.cliente_id = data.cliente_id;
    if (data.fecha_hora) updateData.fecha_hora = data.fecha_hora;
    if (data.notas !== undefined) updateData.notas = data.notas;
    if (data.fue_cancelado !== undefined) updateData.fue_cancelado = data.fue_cancelado;

    // If subservicios are being updated, recalculate total
    if (data.subservicio_ids && data.subservicio_ids.length > 0) {
      const subservicios = await this.subservicioRepository.findByIds(data.subservicio_ids);
      updateData.monto_total_pyg = this.calculateTotal(subservicios);

      // Update the cita first
      await this.citaRepository.update(id, updateData);

      // Delete existing junction entries and create new ones
      await this.citaRepository.deleteCitaSubservicios(id);
      const priceMap = this.createPriceMap(subservicios);
      await this.citaRepository.createCitaSubservicios(id, data.subservicio_ids, priceMap);
    } else {
      // Just update the cita
      await this.citaRepository.update(id, updateData);
    }

    // Return updated cita
    return this.citaRepository.findById(id) as Promise<Cita>;
  }

  /**
   * Cancel a cita (soft cancel by setting fue_cancelado flag)
   */
  async cancel(id: string): Promise<Cita> {
    const cita = await this.citaRepository.findById(id);
    if (!cita) {
      throw new NotFoundError("Cita no encontrada");
    }

    await this.citaRepository.update(id, { fue_cancelado: true });
    return this.citaRepository.findById(id) as Promise<Cita>;
  }

  /**
   * Restore a cancelled cita
   */
  async restore(id: string): Promise<Cita> {
    const cita = await this.citaRepository.findById(id);
    if (!cita) {
      throw new NotFoundError("Cita no encontrada");
    }

    await this.citaRepository.update(id, { fue_cancelado: false });
    return this.citaRepository.findById(id) as Promise<Cita>;
  }

  /**
   * Permanently delete a cita (soft delete)
   */
  async delete(id: string): Promise<void> {
    const cita = await this.citaRepository.findById(id);
    if (!cita) {
      throw new NotFoundError("Cita no encontrada");
    }

    // Delete junction table entries first
    await this.citaRepository.deleteCitaSubservicios(id);
    
    // Soft delete the cita using update with deleted_at
    const deletedAt = new Date().toISOString();
    await this.citaRepository.update(id, { fue_cancelado: true } as any);
    // Note: Soft delete would typically set deleted_at, but citas use fue_cancelado
  }
}

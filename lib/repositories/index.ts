/**
 * Central exports for the repository layer
 * Import repositories from this file for consistency
 */

// Base repository
export { BaseRepository, type IRepository } from "./base-repository"

// Entity repositories
export { 
  ClienteRepository, 
  type CreateClienteDTO, 
  type UpdateClienteDTO 
} from "./cliente-repository"

export {
  CitaRepository,
  type CreateCitaDTO,
  type UpdateCitaDTO
} from "./cita-repository"

export {
  ServicioRepository,
  SubservicioRepository,
  type CreateServicioDTO,
  type UpdateServicioDTO,
  type CreateSubservicioDTO,
  type UpdateSubservicioDTO
} from "./servicio-repository"

export {
  PlantillaRepository,
  type CreatePlantillaDTO,
  type UpdatePlantillaDTO
} from "./plantilla-repository"

export {
  RecordatorioRepository,
  type CreateRecordatorioDTO,
  type UpdateRecordatorioDTO
} from "./recordatorio-repository"

export {
  ProfileRepository,
  type CreateProfileDTO,
  type UpdateProfileDTO
} from "./profile-repository"

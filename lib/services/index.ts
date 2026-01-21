/**
 * Central exports for the service layer
 * Import services from this file for consistency
 */

export { 
  ClienteService 
} from "./cliente-service"

export { 
  UserService,
  type CreateUserDTO
} from "./user-service"

export {
  CitaService,
  type CreateCitaDTO,
  type UpdateCitaDTO
} from "./cita-service"

export {
  ServicioService,
  SubservicioService,
  type CreateSubservicioDTO,
  type UpdateSubservicioDTO
} from "./servicio-service"

export {
  PlantillaService,
  type CreatePlantillaDTO,
  type UpdatePlantillaDTO
} from "./plantilla-service"

export {
  RecordatorioService,
  type CreateRecordatorioDTO,
  type UpdateRecordatorioDTO
} from "./recordatorio-service"

export {
  ProfileService,
  type UpdateProfileDTO
} from "./profile-service"
// export { PlantillaService } from "./plantilla-service"
// export { RecordatorioService } from "./recordatorio-service"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: "admin" | "user"
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  nombre: string
  contacto: string | null
  email: string | null
  es_menor: boolean
  nombre_responsable: string | null
  sexo: "masculino" | "femenino" | "otro" | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ClienteEstadisticas {
  total_facturado: number
  cantidad_citas: number
  monto_promedio: number
  ultima_visita: string | null
}

export interface ClienteConEstadisticas extends Cliente {
  total_facturado: number
  cantidad_citas: number
  monto_promedio: number
  ultima_visita: string | null
}

export interface PlantillaMensaje {
  id: string
  titulo: string
  cuerpo: string
  adjunto_url: string | null
  adjunto_nombre: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Recordatorio {
  id: string
  cliente_id: string
  plantilla_id: string
  fecha_hora: string
  estado: "pendiente" | "enviado" | "fallido"
  telefono_destino: string
  waha_payload: Record<string, unknown> | null
  waha_response: Record<string, unknown> | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  // Joined data
  cliente?: Cliente
  plantilla?: PlantillaMensaje
}

export interface Servicio {
  id: string
  nombre: string
  created_at: string
  updated_at: string
}

export interface Subservicio {
  id: string
  servicio_id: string
  nombre: string
  precio_pyg: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  // Joined data
  servicio?: Servicio
}

export interface CitaSubservicio {
  id: string
  cita_id: string
  subservicio_id: string
  precio_pyg: number
  created_at: string
  // Joined data
  subservicio?: Subservicio
}

export interface Cita {
  id: string
  cliente_id: string
  fecha_hora: string
  monto_total_pyg: number
  enviar_recordatorio: boolean
  recordatorio_id: string | null
  fue_cancelado: boolean
  created_at: string
  updated_at: string
  // Joined data
  cliente?: Cliente
  subservicios?: CitaSubservicio[]
  recordatorio?: Recordatorio
}

"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "@/lib/auth"
import { handleError, success } from "@/lib/errors"
import { CitaService, type CreateCitaDTO, type UpdateCitaDTO } from "@/lib/services"
import { CitaRepository } from "@/lib/repositories/cita-repository"
import { SubservicioRepository } from "@/lib/repositories/servicio-repository"
import { RecordatorioRepository } from "@/lib/repositories/recordatorio-repository"
import { ClienteRepository } from "@/lib/repositories/cliente-repository"
import type { Cita } from "@/lib/types"
import type { ActionResult } from "@/lib/errors"

/**
 * Get all citas with related data
 */
export async function getCitas(): Promise<ActionResult<Cita[]>> {
  try {
    const { supabase } = await withAuth()
    const citaRepository = new CitaRepository(supabase)
    const citas = await citaRepository.findAll()
    
    return success(citas)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get a single cita by ID
 */
export async function getCita(id: string): Promise<ActionResult<Cita>> {
  try {
    const { supabase } = await withAuth()
    const citaRepository = new CitaRepository(supabase)
    const cita = await citaRepository.findById(id)
    
    if (!cita) {
      return handleError(new Error("Cita no encontrada"))
    }
    
    return success(cita)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Create a new cita with subservicios and optional recordatorio
 */
export async function createCita(data: CreateCitaDTO): Promise<ActionResult<Cita>> {
  try {
    const { supabase } = await withAuth()
    
    // Initialize repositories
    const citaRepository = new CitaRepository(supabase)
    const subservicioRepository = new SubservicioRepository(supabase)
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const clienteRepository = new ClienteRepository(supabase)
    
    // Create service with all dependencies
    const citaService = new CitaService(
      citaRepository,
      subservicioRepository,
      recordatorioRepository,
      clienteRepository
    )
    
    // Create the cita
    const cita = await citaService.create(data)
    
    // Revalidate cache
    revalidatePath("/dashboard/agendamientos")
    
    return success(cita)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update an existing cita
 */
export async function updateCita(id: string, data: UpdateCitaDTO): Promise<ActionResult<Cita>> {
  try {
    const { supabase } = await withAuth()
    
    // Initialize repositories
    const citaRepository = new CitaRepository(supabase)
    const subservicioRepository = new SubservicioRepository(supabase)
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const clienteRepository = new ClienteRepository(supabase)
    
    // Create service with all dependencies
    const citaService = new CitaService(
      citaRepository,
      subservicioRepository,
      recordatorioRepository,
      clienteRepository
    )
    
    // Update the cita
    const cita = await citaService.update(id, data)
    
    // Revalidate cache
    revalidatePath("/dashboard/agendamientos")
    
    return success(cita)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Cancel a cita (soft cancel)
 */
export async function cancelCita(id: string): Promise<ActionResult<Cita>> {
  try {
    const { supabase } = await withAuth()
    
    // Initialize repositories
    const citaRepository = new CitaRepository(supabase)
    const subservicioRepository = new SubservicioRepository(supabase)
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const clienteRepository = new ClienteRepository(supabase)
    
    // Create service
    const citaService = new CitaService(
      citaRepository,
      subservicioRepository,
      recordatorioRepository,
      clienteRepository
    )
    
    // Cancel the cita
    const cita = await citaService.cancel(id)
    
    // Revalidate cache
    revalidatePath("/dashboard/agendamientos")
    
    return success(cita)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Restore a cancelled cita
 */
export async function restoreCita(id: string): Promise<ActionResult<Cita>> {
  try {
    const { supabase } = await withAuth()
    
    // Initialize repositories
    const citaRepository = new CitaRepository(supabase)
    const subservicioRepository = new SubservicioRepository(supabase)
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const clienteRepository = new ClienteRepository(supabase)
    
    // Create service
    const citaService = new CitaService(
      citaRepository,
      subservicioRepository,
      recordatorioRepository,
      clienteRepository
    )
    
    // Restore the cita
    const cita = await citaService.restore(id)
    
    // Revalidate cache
    revalidatePath("/dashboard/agendamientos")
    
    return success(cita)
  } catch (error) {
    return handleError(error)
  }
}


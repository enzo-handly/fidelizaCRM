"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "@/lib/auth"
import { handleError, success } from "@/lib/errors"
import { ServicioService, SubservicioService, type CreateSubservicioDTO, type UpdateSubservicioDTO } from "@/lib/services"
import { ServicioRepository, SubservicioRepository } from "@/lib/repositories/servicio-repository"
import type { Servicio, Subservicio } from "@/lib/types"
import type { ActionResult } from "@/lib/errors"

/**
 * Get all servicios
 */
export async function getServicios(): Promise<ActionResult<Servicio[]>> {
  try {
    const { supabase } = await withAuth()
    const servicioRepository = new ServicioRepository(supabase)
    const servicioService = new ServicioService(servicioRepository)
    
    const servicios = await servicioService.findAll()
    return success(servicios)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get all subservicios with servicio relation
 */
export async function getSubservicios(): Promise<ActionResult<Subservicio[]>> {
  try {
    const { supabase } = await withAuth()
    const subservicioRepository = new SubservicioRepository(supabase)
    const servicioRepository = new ServicioRepository(supabase)
    const subservicioService = new SubservicioService(subservicioRepository, servicioRepository)
    
    const subservicios = await subservicioService.findAll()
    return success(subservicios)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get subservicios for a specific servicio
 */
export async function getSubserviciosByServicio(servicioId: string): Promise<ActionResult<Subservicio[]>> {
  try {
    const { supabase } = await withAuth()
    const subservicioRepository = new SubservicioRepository(supabase)
    const servicioRepository = new ServicioRepository(supabase)
    const subservicioService = new SubservicioService(subservicioRepository, servicioRepository)
    
    const subservicios = await subservicioService.findByServicio(servicioId)
    return success(subservicios)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Create a new subservicio
 */
export async function createSubservicio(data: CreateSubservicioDTO): Promise<ActionResult<Subservicio>> {
  try {
    const { supabase } = await withAuth()
    const subservicioRepository = new SubservicioRepository(supabase)
    const servicioRepository = new ServicioRepository(supabase)
    const subservicioService = new SubservicioService(subservicioRepository, servicioRepository)
    
    const subservicio = await subservicioService.create(data)
    
    revalidatePath("/dashboard/servicios")
    return success(subservicio)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update an existing subservicio
 */
export async function updateSubservicio(id: string, data: UpdateSubservicioDTO): Promise<ActionResult<Subservicio>> {
  try {
    const { supabase } = await withAuth()
    const subservicioRepository = new SubservicioRepository(supabase)
    const servicioRepository = new ServicioRepository(supabase)
    const subservicioService = new SubservicioService(subservicioRepository, servicioRepository)
    
    const subservicio = await subservicioService.update(id, data)
    
    revalidatePath("/dashboard/servicios")
    return success(subservicio)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete a subservicio (soft delete)
 */
export async function deleteSubservicio(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await withAuth()
    const subservicioRepository = new SubservicioRepository(supabase)
    const servicioRepository = new ServicioRepository(supabase)
    const subservicioService = new SubservicioService(subservicioRepository, servicioRepository)
    
    await subservicioService.delete(id)
    
    revalidatePath("/dashboard/servicios")
    return success(undefined)
  } catch (error) {
    return handleError(error)
  }
}

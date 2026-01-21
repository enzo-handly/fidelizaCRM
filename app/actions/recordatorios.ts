"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "@/lib/auth"
import { handleError, success } from "@/lib/errors"
import { RecordatorioService, type CreateRecordatorioDTO, type UpdateRecordatorioDTO } from "@/lib/services"
import { RecordatorioRepository } from "@/lib/repositories/recordatorio-repository"
import { ClienteRepository } from "@/lib/repositories/cliente-repository"
import { PlantillaRepository } from "@/lib/repositories/plantilla-repository"
import type { Recordatorio } from "@/lib/types"
import type { ActionResult } from "@/lib/errors"

/**
 * Create a new recordatorio
 */
export async function createRecordatorio(data: CreateRecordatorioDTO): Promise<ActionResult<Recordatorio>> {
  try {
    const { supabase } = await withAuth()
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const clienteRepository = new ClienteRepository(supabase)
    const plantillaRepository = new PlantillaRepository(supabase)
    const recordatorioService = new RecordatorioService(
      recordatorioRepository,
      clienteRepository,
      plantillaRepository
    )
    
    const recordatorio = await recordatorioService.create(data)
    
    revalidatePath("/dashboard/recordatorios")
    return success(recordatorio)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update an existing recordatorio
 */
export async function updateRecordatorio(id: string, data: UpdateRecordatorioDTO): Promise<ActionResult<Recordatorio>> {
  try {
    const { supabase } = await withAuth()
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const clienteRepository = new ClienteRepository(supabase)
    const plantillaRepository = new PlantillaRepository(supabase)
    const recordatorioService = new RecordatorioService(
      recordatorioRepository,
      clienteRepository,
      plantillaRepository
    )
    
    const recordatorio = await recordatorioService.update(id, data)
    
    revalidatePath("/dashboard/recordatorios")
    return success(recordatorio)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete a recordatorio (soft delete)
 */
export async function deleteRecordatorio(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await withAuth()
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const recordatorioService = new RecordatorioService(recordatorioRepository)
    
    await recordatorioService.delete(id)
    
    revalidatePath("/dashboard/recordatorios")
    return success(undefined)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update recordatorio status
 */
export async function updateRecordatorioEstado(
  id: string,
  estado: "pendiente" | "enviado" | "fallido",
  wahaPayload?: Record<string, unknown>,
  wahaResponse?: Record<string, unknown>
): Promise<ActionResult<Recordatorio>> {
  try {
    const { supabase } = await withAuth()
    const recordatorioRepository = new RecordatorioRepository(supabase)
    const recordatorioService = new RecordatorioService(recordatorioRepository)
    
    const recordatorio = await recordatorioService.updateEstado(id, estado, wahaPayload, wahaResponse)
    
    revalidatePath("/dashboard/recordatorios")
    return success(recordatorio)
  } catch (error) {
    return handleError(error)
  }
}

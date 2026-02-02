"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "@/lib/auth/middleware"
import { handleError, type ActionResult } from "@/lib/errors/error-handler"
import { ClienteRepository } from "@/lib/repositories/cliente-repository"
import { ClienteService } from "@/lib/services/cliente-service"
import { CitaRepository } from "@/lib/repositories/cita-repository"
import type { Cliente, Cita, ClienteConEstadisticas } from "@/lib/types"

// Re-export types for backward compatibility
export interface CreateClienteData {
  nombre: string
  contacto?: string
  email?: string
  es_menor: boolean
  nombre_responsable?: string
  sexo?: "masculino" | "femenino" | "otro"
}

export interface UpdateClienteData {
  nombre?: string
  contacto?: string
  email?: string
  es_menor?: boolean
  nombre_responsable?: string
  sexo?: "masculino" | "femenino" | "otro" | null
}

/**
 * Create a new cliente
 * Requires authentication
 */
export async function createCliente(data: CreateClienteData): Promise<ActionResult<Cliente>> {
  try {
    // Authenticate user
    const { supabase } = await withAuth()
    
    // Create service instance with repository
    const repository = new ClienteRepository(supabase)
    const service = new ClienteService(repository)
    
    // Create cliente using service (includes validation)
    const cliente = await service.create(data)
    
    // Revalidate cache
    revalidatePath("/dashboard/clientes")
    
    return { success: true, data: cliente }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update an existing cliente
 * Requires authentication
 */
export async function updateCliente(id: string, data: UpdateClienteData): Promise<ActionResult<Cliente>> {
  try {
    // Authenticate user
    const { supabase } = await withAuth()
    
    // Create service instance with repository
    const repository = new ClienteRepository(supabase)
    const service = new ClienteService(repository)
    
    // Update cliente using service (includes validation)
    const cliente = await service.update(id, data)
    
    // Revalidate cache
    revalidatePath("/dashboard/clientes")
    
    return { success: true, data: cliente }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete a cliente (soft delete)
 * Requires authentication
 */
export async function deleteCliente(id: string): Promise<ActionResult<void>> {
  try {
    // Authenticate user
    const { supabase } = await withAuth()
    
    // Create service instance with repository
    const repository = new ClienteRepository(supabase)
    const service = new ClienteService(repository)
    
    // Delete cliente using service
    await service.delete(id)
    
    // Revalidate cache
    revalidatePath("/dashboard/clientes")
    
    return { success: true, data: undefined }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get all citas for a specific cliente
 * Returns citas ordered by date (ascending) with subservicios and totals
 * Requires authentication
 */
export async function getClienteCitas(clienteId: string): Promise<ActionResult<Cita[]>> {
  try {
    // Authenticate user
    const { supabase } = await withAuth()
    
    // Create repository instance
    const citaRepository = new CitaRepository(supabase)
    
    // Get citas for cliente (repository already includes subservicios relation)
    const citas = await citaRepository.findByClienteId(clienteId)
    
    return { success: true, data: citas }
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Get all clientes with statistics from the database view
 * Uses clientes_estadisticas view for optimized performance
 * Requires authentication
 */
export async function getClientesConEstadisticas(): Promise<ActionResult<ClienteConEstadisticas[]>> {
  try {
    // Authenticate user
    const { supabase } = await withAuth()
    
    // Use repository pattern for data access
    const repository = new ClienteRepository(supabase)
    const clientes = await repository.findAllWithEstadisticas()
    
    return { success: true, data: clientes }
  } catch (error) {
    return handleError(error)
  }
}

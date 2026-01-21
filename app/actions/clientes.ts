"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "@/lib/auth/middleware"
import { handleError, type ActionResult } from "@/lib/errors/error-handler"
import { ClienteRepository } from "@/lib/repositories/cliente-repository"
import { ClienteService } from "@/lib/services/cliente-service"
import type { Cliente } from "@/lib/types"

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

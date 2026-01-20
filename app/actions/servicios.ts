"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Servicio, Subservicio } from "@/lib/types"

export async function getServicios(): Promise<{ success: boolean; data?: Servicio[]; error?: string }> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("servicios").select("*").order("nombre", { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getSubservicios(): Promise<{ success: boolean; data?: Subservicio[]; error?: string }> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("subservicios")
    .select(`
      *,
      servicio:servicios(*)
    `)
    .is("deleted_at", null)
    .order("nombre", { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function getSubserviciosByServicio(
  servicioId: string,
): Promise<{ success: boolean; data?: Subservicio[]; error?: string }> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("subservicios")
    .select(`
      *,
      servicio:servicios(*)
    `)
    .eq("servicio_id", servicioId)
    .is("deleted_at", null)
    .order("nombre", { ascending: true })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function createSubservicio(data: {
  servicio_id: string
  nombre: string
  precio_pyg: number
}): Promise<{ success: boolean; data?: Subservicio; error?: string }> {
  const supabase = await createServerClient()

  const { data: newSubservicio, error } = await supabase.from("subservicios").insert(data).select().single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/servicios")
  return { success: true, data: newSubservicio }
}

export async function updateSubservicio(
  id: string,
  data: {
    servicio_id?: string
    nombre?: string
    precio_pyg?: number
  },
): Promise<{ success: boolean; data?: Subservicio; error?: string }> {
  const supabase = await createServerClient()

  const { data: updatedSubservicio, error } = await supabase
    .from("subservicios")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/servicios")
  return { success: true, data: updatedSubservicio }
}

export async function deleteSubservicio(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()

  // Soft delete
  const { error } = await supabase.from("subservicios").update({ deleted_at: new Date().toISOString() }).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/servicios")
  return { success: true }
}

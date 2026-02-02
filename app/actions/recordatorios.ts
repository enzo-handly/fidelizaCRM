"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface CreateRecordatorioData {
  cliente_id: string
  plantilla_id: string
  fecha_hora: string
  telefono_destino: string
}

interface UpdateRecordatorioData {
  cliente_id?: string
  plantilla_id?: string
  fecha_hora?: string
  telefono_destino?: string
  estado?: "pendiente" | "enviado" | "fallido"
}

export async function createRecordatorio(data: CreateRecordatorioData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("recordatorios").insert({
    cliente_id: data.cliente_id,
    plantilla_id: data.plantilla_id,
    fecha_hora: data.fecha_hora,
    telefono_destino: data.telefono_destino,
    estado: "pendiente",
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/recordatorios")
  return { success: true }
}

export async function updateRecordatorio(id: string, data: UpdateRecordatorioData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("recordatorios").update(data).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/recordatorios")
  return { success: true }
}

export async function deleteRecordatorio(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Soft delete by setting deleted_at timestamp
  const { error } = await supabase.from("recordatorios").update({ deleted_at: new Date().toISOString() }).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/recordatorios")
  return { success: true }
}

export async function updateRecordatorioEstado(
  id: string,
  estado: "pendiente" | "enviado" | "fallido",
  wahaPayload?: Record<string, unknown>,
  wahaResponse?: Record<string, unknown>,
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const updateData: Record<string, unknown> = { estado }
  if (wahaPayload) updateData.waha_payload = wahaPayload
  if (wahaResponse) updateData.waha_response = wahaResponse

  const { error } = await supabase.from("recordatorios").update(updateData).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/recordatorios")
  return { success: true }
}

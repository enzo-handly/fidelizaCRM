"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface CreateClienteData {
  nombre: string
  contacto?: string
  email?: string
  es_menor: boolean
  nombre_responsable?: string
  sexo?: "masculino" | "femenino" | "otro"
}

interface UpdateClienteData {
  nombre?: string
  contacto?: string
  email?: string
  es_menor?: boolean
  nombre_responsable?: string
  sexo?: "masculino" | "femenino" | "otro" | null
}

export async function createCliente(data: CreateClienteData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("clientes").insert({
    nombre: data.nombre,
    contacto: data.contacto || null,
    email: data.email || null,
    es_menor: data.es_menor,
    nombre_responsable: data.es_menor ? data.nombre_responsable : null,
    sexo: data.sexo || null,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/clientes")
  return { success: true }
}

export async function updateCliente(id: string, data: UpdateClienteData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const updateData: UpdateClienteData = { ...data }

  // If not a minor, clear the responsible person field
  if (data.es_menor === false) {
    updateData.nombre_responsable = undefined
  }

  const { error } = await supabase.from("clientes").update(updateData).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/clientes")
  return { success: true }
}

export async function deleteCliente(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Soft delete by setting deleted_at timestamp
  const { error } = await supabase.from("clientes").update({ deleted_at: new Date().toISOString() }).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/clientes")
  return { success: true }
}

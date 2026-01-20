"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Cita } from "@/lib/types"

export async function getCitas(): Promise<Cita[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("citas")
    .select(`
      *,
      cliente:clientes(*),
      subservicios:citas_subservicios(
        *,
        subservicio:subservicios(*)
      )
    `)
    .order("fecha_hora", { ascending: false })

  if (error) {
    console.error("Error fetching citas:", error)
    return []
  }

  return data as Cita[]
}

export async function getCita(id: string): Promise<Cita | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("citas")
    .select(`
      *,
      cliente:clientes(*),
      subservicios:citas_subservicios(
        *,
        subservicio:subservicios(*)
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching cita:", error)
    return null
  }

  return data as Cita
}

interface CreateCitaData {
  cliente_id: string
  fecha_hora: string
  subservicio_ids: string[]
  enviar_recordatorio: boolean
  plantilla_id?: string
}

export async function createCita(data: CreateCitaData) {
  console.log("[v0] createCita called with data:", data)

  const supabase = await createClient()

  // First, get the prices for the selected subservicios
  console.log("[v0] Fetching subservicios prices for IDs:", data.subservicio_ids)

  const { data: subservicios, error: subError } = await supabase
    .from("subservicios")
    .select("id, precio_pyg")
    .in("id", data.subservicio_ids)

  if (subError) {
    console.error("[v0] Error fetching subservicios:", subError)
    return { success: false, error: "Error al obtener precios de servicios: " + subError.message }
  }

  if (!subservicios || subservicios.length === 0) {
    console.error("[v0] No subservicios found for IDs:", data.subservicio_ids)
    return { success: false, error: "No se encontraron los servicios seleccionados" }
  }

  console.log("[v0] Subservicios fetched:", subservicios)

  // Calculate total
  const monto_total_pyg = subservicios.reduce((sum, s) => sum + s.precio_pyg, 0)
  console.log("[v0] Total calculated:", monto_total_pyg)

  // Create the cita
  const { data: cita, error: citaError } = await supabase
    .from("citas")
    .insert({
      cliente_id: data.cliente_id,
      fecha_hora: data.fecha_hora,
      monto_total_pyg,
      enviar_recordatorio: data.enviar_recordatorio,
    })
    .select()
    .single()

  if (citaError) {
    console.error("[v0] Error creating cita:", citaError)
    return { success: false, error: citaError.message }
  }

  if (!cita) {
    console.error("[v0] No cita returned after insert")
    return { success: false, error: "Error al crear cita" }
  }

  console.log("[v0] Cita created:", cita.id)

  // Create the citas_subservicios entries
  const citaSubservicios = subservicios.map((s) => ({
    cita_id: cita.id,
    subservicio_id: s.id,
    precio_pyg: s.precio_pyg,
  }))

  console.log("[v0] Inserting citas_subservicios:", citaSubservicios)

  const { error: junctionError } = await supabase.from("citas_subservicios").insert(citaSubservicios)

  if (junctionError) {
    console.error("[v0] Error creating citas_subservicios:", junctionError)
    // Rollback: delete the cita
    await supabase.from("citas").delete().eq("id", cita.id)
    return { success: false, error: "Error al asociar servicios a la cita: " + junctionError.message }
  }

  console.log("[v0] Citas_subservicios created successfully")

  // If reminder is enabled, create a recordatorio
  if (data.enviar_recordatorio && data.plantilla_id) {
    console.log("[v0] Creating reminder for cita")
    const { data: cliente } = await supabase.from("clientes").select("contacto").eq("id", data.cliente_id).single()

    if (cliente?.contacto) {
      const { data: recordatorio, error: recordatorioError } = await supabase
        .from("recordatorios")
        .insert({
          cliente_id: data.cliente_id,
          plantilla_id: data.plantilla_id,
          fecha_hora: data.fecha_hora,
          telefono_destino: cliente.contacto,
          estado: "pendiente",
        })
        .select()
        .single()

      if (recordatorioError) {
        console.error("[v0] Error creating recordatorio:", recordatorioError)
      } else if (recordatorio) {
        console.log("[v0] Recordatorio created:", recordatorio.id)
        await supabase.from("citas").update({ recordatorio_id: recordatorio.id }).eq("id", cita.id)
      }
    }
  }

  console.log("[v0] Cita creation complete, revalidating path")
  revalidatePath("/dashboard/agendamientos")
  return { success: true, data: cita }
}

interface UpdateCitaData {
  cliente_id: string
  fecha_hora: string
  subservicio_ids: string[]
  enviar_recordatorio: boolean
}

export async function updateCita(id: string, data: UpdateCitaData) {
  const supabase = await createClient()

  // Get the prices for the selected subservicios
  const { data: subservicios, error: subError } = await supabase
    .from("subservicios")
    .select("id, precio_pyg")
    .in("id", data.subservicio_ids)

  if (subError) {
    return { success: false, error: subError.message }
  }

  if (!subservicios || subservicios.length === 0) {
    return { success: false, error: "No se encontraron los servicios seleccionados" }
  }

  // Calculate total
  const monto_total_pyg = subservicios.reduce((sum, s) => sum + s.precio_pyg, 0)

  // Update the cita
  const { error: citaError } = await supabase
    .from("citas")
    .update({
      cliente_id: data.cliente_id,
      fecha_hora: data.fecha_hora,
      monto_total_pyg,
      enviar_recordatorio: data.enviar_recordatorio,
    })
    .eq("id", id)

  if (citaError) {
    return { success: false, error: citaError.message }
  }

  // Delete existing junction entries
  await supabase.from("citas_subservicios").delete().eq("cita_id", id)

  // Create new junction entries
  const citaSubservicios = subservicios.map((s) => ({
    cita_id: id,
    subservicio_id: s.id,
    precio_pyg: s.precio_pyg,
  }))

  const { error: junctionError } = await supabase.from("citas_subservicios").insert(citaSubservicios)

  if (junctionError) {
    return { success: false, error: "Error al actualizar servicios de la cita" }
  }

  revalidatePath("/dashboard/agendamientos")
  return { success: true }
}

export async function cancelCita(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("citas").update({ fue_cancelado: true }).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/agendamientos")
  return { success: true }
}

export async function restoreCita(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("citas").update({ fue_cancelado: false }).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/agendamientos")
  return { success: true }
}

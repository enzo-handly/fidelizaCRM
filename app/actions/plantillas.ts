"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

interface CreatePlantillaData {
  titulo: string
  cuerpo: string
  adjunto_url?: string
  adjunto_nombre?: string
}

interface UpdatePlantillaData {
  titulo?: string
  cuerpo?: string
  adjunto_url?: string | null
  adjunto_nombre?: string | null
}

export async function createPlantilla(data: CreatePlantillaData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("plantillas_mensajes").insert({
    titulo: data.titulo,
    cuerpo: data.cuerpo,
    adjunto_url: data.adjunto_url || null,
    adjunto_nombre: data.adjunto_nombre || null,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/plantillas")
  return { success: true }
}

export async function updatePlantilla(id: string, data: UpdatePlantillaData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase.from("plantillas_mensajes").update(data).eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/plantillas")
  return { success: true }
}

export async function deletePlantilla(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Soft delete by setting deleted_at timestamp
  const { error } = await supabase
    .from("plantillas_mensajes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/plantillas")
  return { success: true }
}

export async function duplicatePlantilla(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // First, get the original plantilla
  const { data: original, error: fetchError } = await supabase
    .from("plantillas_mensajes")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !original) {
    return { success: false, error: "Plantilla no encontrada" }
  }

  // Create a duplicate with "(Copia)" appended to the title
  const { error: insertError } = await supabase.from("plantillas_mensajes").insert({
    titulo: `${original.titulo} (Copia)`,
    cuerpo: original.cuerpo,
    adjunto_url: original.adjunto_url,
    adjunto_nombre: original.adjunto_nombre,
  })

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath("/dashboard/plantillas")
  return { success: true }
}

export async function uploadAttachment(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const file = formData.get("file") as File
  if (!file) {
    return { success: false, error: "No file provided" }
  }

  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `attachments/${fileName}`

  const { error: uploadError } = await supabase.storage.from("plantillas-adjuntos").upload(filePath, file)

  if (uploadError) {
    return { success: false, error: uploadError.message }
  }

  const { data: publicUrl } = supabase.storage.from("plantillas-adjuntos").getPublicUrl(filePath)

  return {
    success: true,
    url: publicUrl.publicUrl,
    fileName: file.name,
  }
}

export async function deleteAttachment(url: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  // Extract the file path from the URL
  const urlParts = url.split("/plantillas-adjuntos/")
  if (urlParts.length < 2) {
    return { success: false, error: "Invalid file URL" }
  }

  const filePath = urlParts[1]

  const { error } = await supabase.storage.from("plantillas-adjuntos").remove([filePath])

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

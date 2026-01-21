"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "@/lib/auth"
import { handleError, success } from "@/lib/errors"
import { PlantillaService, type CreatePlantillaDTO, type UpdatePlantillaDTO } from "@/lib/services"
import { PlantillaRepository } from "@/lib/repositories/plantilla-repository"
import { createClient } from "@/lib/supabase/server"
import type { PlantillaMensaje } from "@/lib/types"
import type { ActionResult } from "@/lib/errors"

/**
 * Create a new plantilla
 */
export async function createPlantilla(data: CreatePlantillaDTO): Promise<ActionResult<PlantillaMensaje>> {
  try {
    const { supabase } = await withAuth()
    const plantillaRepository = new PlantillaRepository(supabase)
    const plantillaService = new PlantillaService(plantillaRepository)
    
    const plantilla = await plantillaService.create(data)
    
    revalidatePath("/dashboard/plantillas")
    return success(plantilla)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Update an existing plantilla
 */
export async function updatePlantilla(id: string, data: UpdatePlantillaDTO): Promise<ActionResult<PlantillaMensaje>> {
  try {
    const { supabase } = await withAuth()
    const plantillaRepository = new PlantillaRepository(supabase)
    const plantillaService = new PlantillaService(plantillaRepository)
    
    const plantilla = await plantillaService.update(id, data)
    
    revalidatePath("/dashboard/plantillas")
    return success(plantilla)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete a plantilla (soft delete)
 */
export async function deletePlantilla(id: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await withAuth()
    const plantillaRepository = new PlantillaRepository(supabase)
    const plantillaService = new PlantillaService(plantillaRepository)
    
    await plantillaService.delete(id)
    
    revalidatePath("/dashboard/plantillas")
    return success(undefined)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Duplicate a plantilla
 */
export async function duplicatePlantilla(id: string): Promise<ActionResult<PlantillaMensaje>> {
  try {
    const { supabase } = await withAuth()
    const plantillaRepository = new PlantillaRepository(supabase)
    const plantillaService = new PlantillaService(plantillaRepository)
    
    const plantilla = await plantillaService.duplicate(id)
    
    revalidatePath("/dashboard/plantillas")
    return success(plantilla)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Upload an attachment for a plantilla
 */
export async function uploadAttachment(formData: FormData): Promise<ActionResult<{ url: string; fileName: string }>> {
  try {
    const { supabase } = await withAuth()
    
    const file = formData.get("file") as File
    if (!file) {
      return handleError(new Error("No file provided"))
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `attachments/${fileName}`

    const { error: uploadError } = await supabase.storage.from("plantillas-adjuntos").upload(filePath, file)

    if (uploadError) {
      return handleError(uploadError)
    }

    const { data: publicUrl } = supabase.storage.from("plantillas-adjuntos").getPublicUrl(filePath)

    return success({
      url: publicUrl.publicUrl,
      fileName: file.name,
    })
  } catch (error) {
    return handleError(error)
  }
}

/**
 * Delete an attachment from storage
 */
export async function deleteAttachment(url: string): Promise<ActionResult<void>> {
  try {
    const { supabase } = await withAuth()
    
    // Extract the file path from the URL
    const urlParts = url.split("/plantillas-adjuntos/")
    if (urlParts.length < 2) {
      return handleError(new Error("Invalid file URL"))
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage.from("plantillas-adjuntos").remove([filePath])

    if (error) {
      return handleError(error)
    }

    return success(undefined)
  } catch (error) {
    return handleError(error)
  }
}

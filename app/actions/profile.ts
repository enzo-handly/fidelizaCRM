"use server"

import { revalidatePath } from "next/cache"
import { withAuth } from "@/lib/auth"
import { handleError, success } from "@/lib/errors"
import { ProfileService, type UpdateProfileDTO } from "@/lib/services"
import { ProfileRepository } from "@/lib/repositories/profile-repository"
import type { Profile } from "@/lib/types"
import type { ActionResult } from "@/lib/errors"

/**
 * Update the current user's profile
 */
export async function updateProfile(data: UpdateProfileDTO): Promise<ActionResult<Profile>> {
  try {
    const { supabase, user } = await withAuth()
    const profileRepository = new ProfileRepository(supabase)
    const profileService = new ProfileService(profileRepository)
    
    const profile = await profileService.update(user.id, data)
    
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/settings")
    return success(profile)
  } catch (error) {
    return handleError(error)
  }
}

"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateUserData {
  email: string
  password: string
  full_name: string
  role: "admin" | "user"
}

interface UpdateUserData {
  full_name: string
  role: "admin" | "user"
}

export async function createUser(data: CreateUserData) {
  const supabase = await createClient()

  // Verify the current user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (currentProfile?.role !== "admin") {
    return { success: false, error: "Only administrators can create users" }
  }

  // Use service role client to create user
  const serviceClient = await createServiceClient()

  const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      role: data.role,
    },
  })

  if (createError) {
    return { success: false, error: createError.message }
  }

  revalidatePath("/dashboard/users")
  return { success: true, user: newUser.user }
}

export async function updateUser(userId: string, data: UpdateUserData) {
  const supabase = await createClient()

  // Verify the current user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (currentProfile?.role !== "admin") {
    return { success: false, error: "Only administrators can update users" }
  }

  // Use service role client to update profile
  const serviceClient = await createServiceClient()

  const { error: updateError } = await serviceClient
    .from("profiles")
    .update({
      full_name: data.full_name,
      role: data.role,
    })
    .eq("id", userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath("/dashboard/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()

  // Verify the current user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  if (user.id === userId) {
    return { success: false, error: "You cannot delete your own account" }
  }

  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (currentProfile?.role !== "admin") {
    return { success: false, error: "Only administrators can delete users" }
  }

  // Use service role client to delete user
  const serviceClient = await createServiceClient()

  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(userId)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  revalidatePath("/dashboard/users")
  return { success: true }
}

export async function toggleUserActive(userId: string, activo: boolean) {
  const supabase = await createClient()

  // Verify the current user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "No autenticado" }
  }

  if (user.id === userId) {
    return { success: false, error: "No puedes desactivar tu propia cuenta" }
  }

  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (currentProfile?.role !== "admin") {
    return { success: false, error: "Solo los administradores pueden modificar usuarios" }
  }

  // Use service role client to update profile
  const serviceClient = await createServiceClient()

  const { error: updateError } = await serviceClient.from("profiles").update({ activo }).eq("id", userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  revalidatePath("/dashboard/usuarios")
  return { success: true }
}

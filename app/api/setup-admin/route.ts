import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Get credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME || "Admin User"

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required" },
        { status: 500 }
      )
    }

    const adminClient = createAdminClient()

    // Check if admin already exists
    const { data: existingUser } = await adminClient.auth.admin.listUsers()
    const adminExists = existingUser?.users?.some((user) => user.email === adminEmail)

    if (adminExists) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 200 })
    }

    // Create the admin user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        full_name: adminName,
      },
    })

    if (createError) {
      console.error("[v0] Error creating admin user:", createError)
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    // Update the profile to set admin role
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({ role: "admin", full_name: adminName })
      .eq("id", newUser.user!.id)

    if (updateError) {
      console.error("[v0] Error updating profile:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: {
          id: newUser.user!.id,
          email: newUser.user!.email,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
  }
}

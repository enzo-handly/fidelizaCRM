import { createClient } from "@supabase/supabase-js"

// This script creates the default admin user
// Run this once to set up your admin account

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function seedAdmin() {
  try {
    // Get credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const adminName = process.env.ADMIN_NAME || "Admin User"

    if (!adminEmail || !adminPassword) {
      console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required")
      console.log("Please set them in your .env.local file or pass them as environment variables")
      process.exit(1)
    }

    console.log("Creating admin user...")

    // Create the admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: adminName,
        role: "admin",
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError.message)
      return
    }

    console.log("Admin user created successfully!")
    console.log("User ID:", authData.user.id)
    console.log("Email:", authData.user.email)

    // The profile will be automatically created by the trigger
    // Let's verify it was created with admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError.message)
      return
    }

    console.log("Profile created with role:", profile.role)
    console.log("\nYou can now login with:")
    console.log("Email:", process.env.ADMIN_EMAIL)
    console.log("Password: [hidden for security]")
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

seedAdmin()

import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import type { Profile } from "@/lib/types"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Try to get user with error handling
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      console.error("[v0] Auth error in dashboard layout:", error)
      redirect("/login")
    }
    user = data.user
  } catch (error) {
    console.error("[v0] Failed to fetch user in dashboard layout:", error)
    redirect("/login")
  }

  if (!user) {
    redirect("/login")
  }

  // Try to get profile with error handling
  let profile = null
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  } catch (error) {
    console.error("[v0] Failed to fetch profile:", error)
  }

  const userProfile: Profile = profile || {
    id: user.id,
    email: user.email || "",
    full_name: null,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    activo: true,
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar profile={userProfile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader profile={userProfile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

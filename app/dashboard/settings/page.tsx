import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form"
import type { Profile } from "@/lib/types"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const userProfile: Profile = profile || {
    id: user.id,
    email: user.email || "",
    full_name: null,
    role: "user",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <ProfileSettingsForm profile={userProfile} />
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UsersTable } from "@/components/dashboard/usuarios/users-table"
import { CreateUserDialog } from "@/components/dashboard/usuarios/create-user-dialog"
import type { Profile } from "@/lib/types"

export default async function UsuariosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Check if current user is admin
  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (currentProfile?.role !== "admin") {
    redirect("/dashboard/clientes")
  }

  // Get all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona las cuentas de usuario y permisos</p>
        </div>
        <CreateUserDialog />
      </div>

      <UsersTable users={(users as Profile[]) || []} currentUserId={user.id} />
    </div>
  )
}

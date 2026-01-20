import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientesTable } from "@/components/dashboard/clientes-table"
import { CreateClienteDialog } from "@/components/dashboard/create-cliente-dialog"
import type { Cliente } from "@/lib/types"

export default async function ClientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get all non-deleted clients
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona tu cartera de clientes</p>
        </div>
        <CreateClienteDialog />
      </div>

      <ClientesTable clientes={(clientes as Cliente[]) || []} />
    </div>
  )
}

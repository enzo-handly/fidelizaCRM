import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClientesTable } from "@/components/dashboard/clientes/clientes-table"
import { CreateClienteDialog } from "@/components/dashboard/clientes/create-cliente-dialog"
import type { ClienteConEstadisticas } from "@/lib/types"

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get all non-deleted clients with statistics from the optimized view
  const { data: clientes } = await supabase
    .from("clientes_estadisticas")
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

      <ClientesTable clientes={(clientes as ClienteConEstadisticas[]) || []} />
    </div>
  )
}

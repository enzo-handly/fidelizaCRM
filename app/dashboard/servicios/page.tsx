import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ServiciosView } from "@/components/dashboard/servicios/servicios-view"
import { getServicios, getSubservicios } from "@/app/actions/servicios"

export default async function ServiciosPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [serviciosResult, subserviciosResult] = await Promise.all([getServicios(), getSubservicios()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
        <p className="text-muted-foreground">Gestiona las categorías de servicios y sus subservicios facturables.</p>
      </div>

      <ServiciosView servicios={serviciosResult.data || []} subservicios={subserviciosResult.data || []} />
    </div>
  )
}

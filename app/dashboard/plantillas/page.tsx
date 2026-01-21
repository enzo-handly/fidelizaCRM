import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PlantillasTable } from "@/components/dashboard/plantillas/plantillas-table"
import { CreatePlantillaDialog } from "@/components/dashboard/plantillas/create-plantilla-dialog"
import type { PlantillaMensaje } from "@/lib/types"

export default async function PlantillasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: plantillas } = await supabase
    .from("plantillas_mensajes")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plantillas de Mensajes</h1>
          <p className="text-muted-foreground">
            Gestiona las plantillas de mensajes para comunicarte con tus clientes.
          </p>
        </div>
        <CreatePlantillaDialog />
      </div>

      <PlantillasTable plantillas={(plantillas as PlantillaMensaje[]) || []} />
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RecordatoriosTable } from "@/components/dashboard/recordatorios-table"
import { CreateRecordatorioDialog } from "@/components/dashboard/create-recordatorio-dialog"
import type { Recordatorio, Cliente, PlantillaMensaje } from "@/lib/types"

export default async function RecordatoriosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch recordatorios with joined cliente and plantilla data
  const { data: recordatorios } = await supabase
    .from("recordatorios")
    .select(`
      *,
      cliente:clientes(*),
      plantilla:plantillas_mensajes(*)
    `)
    .is("deleted_at", null)
    .order("fecha_hora", { ascending: true })

  // Fetch clientes for the create dialog
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .is("deleted_at", null)
    .order("nombre", { ascending: true })

  // Fetch plantillas for the create dialog
  const { data: plantillas } = await supabase
    .from("plantillas_mensajes")
    .select("*")
    .is("deleted_at", null)
    .order("titulo", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Recordatorios</h1>
          <p className="text-muted-foreground">Gestiona los recordatorios programados para tus clientes.</p>
        </div>
        <CreateRecordatorioDialog
          clientes={(clientes as Cliente[]) || []}
          plantillas={(plantillas as PlantillaMensaje[]) || []}
        />
      </div>

      <RecordatoriosTable
        recordatorios={(recordatorios as Recordatorio[]) || []}
        clientes={(clientes as Cliente[]) || []}
        plantillas={(plantillas as PlantillaMensaje[]) || []}
      />
    </div>
  )
}

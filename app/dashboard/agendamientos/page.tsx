import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CitasCalendar } from "@/components/dashboard/citas/citas-calendar"
import { CreateCitaDialog } from "@/components/dashboard/citas/create-cita-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, CalendarClock } from "lucide-react"
import type { Cita } from "@/lib/types"

async function getPageData() {
  try {
    const supabase = await createClient()

    console.log("[v0] Agendamientos: Getting user...")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("[v0] Agendamientos auth error:", authError)
      return null
    }

    if (!user) {
      console.log("[v0] Agendamientos: No user found")
      return null
    }

    console.log("[v0] Agendamientos: User authenticated, fetching data...")

    // Fetch all data in parallel using the same client instance
    const [citasResult, clientesResult, serviciosResult, plantillasResult] = await Promise.all([
      supabase
        .from("citas")
        .select(`
          *,
          cliente:clientes(*),
          subservicios:citas_subservicios(
            *,
            subservicio:subservicios(*)
          )
        `)
        .order("fecha_hora", { ascending: false }),
      supabase.from("clientes").select("*").is("deleted_at", null).order("nombre"),
      supabase
        .from("servicios")
        .select(`
          *,
          subservicios(*)
        `)
        .order("nombre"),
      supabase.from("plantillas_mensajes").select("*").is("deleted_at", null).order("titulo"),
    ])

    console.log("[v0] Agendamientos data fetched:", {
      citas: citasResult.data?.length || 0,
      clientes: clientesResult.data?.length || 0,
      servicios: serviciosResult.data?.length || 0,
      plantillas: plantillasResult.data?.length || 0,
    })

    if (citasResult.error) {
      console.error("[v0] Error fetching citas:", citasResult.error)
    }
    if (clientesResult.error) {
      console.error("[v0] Error fetching clientes:", clientesResult.error)
    }
    if (serviciosResult.error) {
      console.error("[v0] Error fetching servicios:", serviciosResult.error)
    }
    if (plantillasResult.error) {
      console.error("[v0] Error fetching plantillas:", plantillasResult.error)
    }

    return {
      citas: (citasResult.data || []) as Cita[],
      clientes: clientesResult.data || [],
      servicios: serviciosResult.data || [],
      plantillas: plantillasResult.data || [],
    }
  } catch (error) {
    console.error("[v0] Agendamientos: Unexpected error in getPageData:", error)
    return null
  }
}

function getTodayAppointmentsCount(citas: Cita[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return citas.filter((cita) => {
    const citaDate = new Date(cita.fecha_hora)
    return citaDate >= today && citaDate < tomorrow && !cita.fue_cancelado
  }).length
}

function getUpcomingAppointmentsCount(citas: Cita[]) {
  const now = new Date()
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  return citas.filter((cita) => {
    const citaDate = new Date(cita.fecha_hora)
    return citaDate >= now && citaDate <= nextWeek && !cita.fue_cancelado
  }).length
}

export default async function AgendamientosPage() {
  let data
  try {
    data = await getPageData()
  } catch (error) {
    console.error("[v0] Agendamientos page error:", error)
    redirect("/login")
  }

  if (!data) {
    console.log("[v0] Agendamientos: Redirecting to login (no data)")
    redirect("/login")
  }

  const { citas, clientes, servicios, plantillas } = data

  console.log(
    "[v0] Agendamientos: Rendering page with servicios:",
    servicios.map((s) => ({
      id: s.id,
      nombre: s.nombre,
      subservicios_count: s.subservicios?.length || 0,
    })),
  )

  const todayCount = getTodayAppointmentsCount(citas)
  const upcomingCount = getUpcomingAppointmentsCount(citas)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamientos</h1>
          <p className="text-muted-foreground">Gestiona las citas y agendamientos de tus clientes</p>
        </div>
        <CreateCitaDialog clientes={clientes} servicios={servicios} plantillas={plantillas} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">
              {todayCount === 1 ? "cita programada" : "citas programadas"} para hoy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos 7 días</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingCount === 1 ? "cita" : "citas"} en la próxima semana
            </p>
          </CardContent>
        </Card>
      </div>

      <CitasCalendar citas={citas} clientes={clientes} servicios={servicios} plantillas={plantillas} />
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarCheck, Bell, Users } from "lucide-react"
import { DashboardChart } from "@/components/dashboard/shared/dashboard-chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard/clientes")
  }

  // Get today's date boundaries
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()

  // Get current month boundaries for chart
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString()

  // Fetch all stats in parallel
  const [{ count: citasHoy }, { count: recordatoriosProgramados }, { count: totalClientes }, { data: citasDelMes }] =
    await Promise.all([
      // Total citas hoy (non-cancelled)
      supabase
        .from("citas")
        .select("*", { count: "exact", head: true })
        .eq("fue_cancelado", false)
        .gte("fecha_hora", startOfDay)
        .lt("fecha_hora", endOfDay),

      // Recordatorios programados (pendientes)
      supabase
        .from("recordatorios")
        .select("*", { count: "exact", head: true })
        .eq("estado", "pendiente")
        .is("deleted_at", null),

      // Total clientes registrados
      supabase
        .from("clientes")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null),

      // Citas del mes actual (non-cancelled) para el gráfico
      supabase
        .from("citas")
        .select("fecha_hora, monto_total_pyg")
        .eq("fue_cancelado", false)
        .gte("fecha_hora", startOfMonth)
        .lte("fecha_hora", endOfMonth)
        .order("fecha_hora", { ascending: true }),
    ])

  // Process chart data - aggregate by day
  const chartDataMap = new Map<string, number>()

  // Initialize all days of the month
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    chartDataMap.set(dateKey, 0)
  }

  // Sum monto_total_pyg per day
  citasDelMes?.forEach((cita) => {
    const date = new Date(cita.fecha_hora)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    const current = chartDataMap.get(dateKey) || 0
    chartDataMap.set(dateKey, current + (cita.monto_total_pyg || 0))
  })

  // Convert to array for chart
  const chartData = Array.from(chartDataMap.entries()).map(([date, total]) => ({
    date,
    total,
    // Format date for display
    label: new Date(date).toLocaleDateString("es-PY", { day: "numeric", month: "short" }),
  }))

  const stats = [
    {
      title: "Total Citas Hoy",
      value: citasHoy || 0,
      description: "Citas programadas para hoy",
      icon: CalendarCheck,
    },
    {
      title: "Recordatorios Programados",
      value: recordatoriosProgramados || 0,
      description: "Recordatorios pendientes de envío",
      icon: Bell,
    },
    {
      title: "Total Clientes",
      value: totalClientes || 0,
      description: "Clientes registrados en el sistema",
      icon: Users,
    },
  ]

  // Get month name for chart title
  const monthName = today.toLocaleDateString("es-PY", { month: "long", year: "numeric" })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Panel de administración de FidelizaCRM</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value.toLocaleString("es-PY")}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Billing Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Facturación Diaria</CardTitle>
          <CardDescription>Total facturado por día en {monthName} (solo citas no canceladas)</CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  )
}

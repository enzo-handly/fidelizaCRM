"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CalendarDays,
  CalendarRange,
  MoreHorizontal,
  Eye,
  Pencil,
  XCircle,
  Bell,
} from "lucide-react"
import type { Cita, Cliente, Servicio, Subservicio, PlantillaMensaje } from "@/lib/types"
import { EditCitaDialog } from "./edit-cita-dialog"
import { cancelCita, restoreCita } from "@/app/actions/citas"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface ServicioWithSubservicios extends Servicio {
  subservicios: Subservicio[]
}

interface CitasCalendarProps {
  citas: Cita[]
  clientes: Cliente[]
  servicios: ServicioWithSubservicios[]
  plantillas: PlantillaMensaje[]
}

type ViewMode = "day" | "week" | "month"

export function CitasCalendar({ citas, clientes, servicios, plantillas }: CitasCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const activeCitas = citas.filter((c) => !c.fue_cancelado)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-PY", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Navigation functions
  const goToToday = () => setCurrentDate(new Date())

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") newDate.setDate(newDate.getDate() - 1)
    else if (viewMode === "week") newDate.setDate(newDate.getDate() - 7)
    else newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") newDate.setDate(newDate.getDate() + 1)
    else if (viewMode === "week") newDate.setDate(newDate.getDate() + 7)
    else newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // Get date range label
  const getDateRangeLabel = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("es-PY", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (viewMode === "week") {
      const startOfWeek = getStartOfWeek(currentDate)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      return `${startOfWeek.toLocaleDateString("es-PY", { day: "numeric", month: "short" })} - ${endOfWeek.toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric" })}`
    } else {
      return currentDate.toLocaleDateString("es-PY", { month: "long", year: "numeric" })
    }
  }

  // Helper functions
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday start
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isToday = (date: Date) => isSameDay(date, new Date())

  // Get citas for a specific day
  const getCitasForDay = (date: Date) => {
    return activeCitas
      .filter((cita) => {
        const citaDate = new Date(cita.fecha_hora)
        return isSameDay(citaDate, date)
      })
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
  }

  // Generate week days
  const getWeekDays = () => {
    const startOfWeek = getStartOfWeek(currentDate)
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(day.getDate() + i)
      days.push(day)
    }
    return days
  }

  // Generate month days
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = getStartOfWeek(firstDay)

    const days = []
    const current = new Date(startDate)

    // Generate 6 weeks
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  // Handle actions
  const handleCancel = async () => {
    if (!selectedCita) return
    setIsProcessing(true)
    const result = await cancelCita(selectedCita.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al cancelar cita")
    }
    setIsProcessing(false)
    setCancelDialogOpen(false)
    setSelectedCita(null)
  }

  const handleRestore = async (cita: Cita) => {
    setIsProcessing(true)
    const result = await restoreCita(cita.id)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al restaurar cita")
    }
    setIsProcessing(false)
  }

  // Cita card component
  const CitaCard = ({ cita, compact = false }: { cita: Cita; compact?: boolean }) => {
    const isPast = new Date(cita.fecha_hora) < new Date()

    return (
      <div
        className={cn(
          "group relative p-2 rounded-md border text-xs cursor-pointer transition-colors",
          isPast ? "bg-muted/50 border-muted" : "bg-background border-border hover:border-foreground/30",
          compact && "p-1",
        )}
        onClick={() => {
          setSelectedCita(cita)
          setDetailsDialogOpen(true)
        }}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <p className={cn("font-medium truncate", compact && "text-[10px]")}>
              {formatTime(cita.fecha_hora)} - {cita.cliente?.nombre || "Cliente"}
            </p>
            {!compact && (
              <p className="text-muted-foreground truncate">
                {cita.subservicios
                  ?.slice(0, 2)
                  .map((cs) => cs.subservicio?.nombre)
                  .join(", ")}
                {(cita.subservicios?.length || 0) > 2 && ` +${(cita.subservicios?.length || 0) - 2}`}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCita(cita)
                  setDetailsDialogOpen(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCita(cita)
                  setEditDialogOpen(true)
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCita(cita)
                  setCancelDialogOpen(true)
                }}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {cita.enviar_recordatorio && !compact && (
          <Badge variant="outline" className="mt-1 text-[10px] h-4 border-green-500 text-green-600">
            <Bell className="mr-1 h-2 w-2" />
            Recordatorio
          </Badge>
        )}
      </div>
    )
  }

  // Day View
  const DayView = () => {
    const dayCitas = getCitasForDay(currentDate)
    const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7am to 8pm

    return (
      <div className="border rounded-lg overflow-hidden">
        <div
          className={cn(
            "p-3 text-center border-b font-medium",
            isToday(currentDate) && "bg-foreground text-background",
          )}
        >
          {currentDate.toLocaleDateString("es-PY", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourCitas = dayCitas.filter((cita) => {
              const citaHour = new Date(cita.fecha_hora).getHours()
              return citaHour === hour
            })

            return (
              <div key={hour} className="flex min-h-[60px]">
                <div className="w-16 p-2 text-xs text-muted-foreground border-r bg-muted/30 flex-shrink-0">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div className="flex-1 p-1 space-y-1">
                  {hourCitas.map((cita) => (
                    <CitaCard key={cita.id} cita={cita} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Week View
  const WeekView = () => {
    const weekDays = getWeekDays()
    const hours = Array.from({ length: 14 }, (_, i) => i + 7)

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-2 text-xs text-muted-foreground border-r bg-muted/30" />
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={cn(
                "p-2 text-center border-r last:border-r-0",
                isToday(day) && "bg-foreground text-background",
              )}
            >
              <p className="text-xs font-medium">{day.toLocaleDateString("es-PY", { weekday: "short" })}</p>
              <p className="text-lg font-bold">{day.getDate()}</p>
            </div>
          ))}
        </div>
        {/* Time grid */}
        <div className="max-h-[500px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[50px]">
              <div className="p-1 text-[10px] text-muted-foreground border-r bg-muted/30 flex-shrink-0">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {weekDays.map((day, idx) => {
                const dayCitas = getCitasForDay(day).filter((cita) => {
                  const citaHour = new Date(cita.fecha_hora).getHours()
                  return citaHour === hour
                })

                return (
                  <div key={idx} className="p-0.5 border-r last:border-r-0 space-y-0.5">
                    {dayCitas.map((cita) => (
                      <CitaCard key={cita.id} cita={cita} compact />
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Month View
  const MonthView = () => {
    const monthDays = getMonthDays()
    const weekDayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b">
          {weekDayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium text-muted-foreground border-r last:border-r-0 bg-muted/30"
            >
              {day}
            </div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7">
          {monthDays.map((day, idx) => {
            const dayCitas = getCitasForDay(day)
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()

            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] p-1 border-r border-b last:border-r-0",
                  !isCurrentMonth && "bg-muted/30",
                  isToday(day) && "bg-foreground/5",
                )}
              >
                <p
                  className={cn(
                    "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                    !isCurrentMonth && "text-muted-foreground",
                    isToday(day) && "bg-foreground text-background",
                  )}
                >
                  {day.getDate()}
                </p>
                <div className="space-y-0.5">
                  {dayCitas.slice(0, 3).map((cita) => (
                    <div
                      key={cita.id}
                      className="text-[10px] p-1 rounded bg-muted truncate cursor-pointer hover:bg-muted/80"
                      onClick={() => {
                        setSelectedCita(cita)
                        setDetailsDialogOpen(true)
                      }}
                    >
                      {formatTime(cita.fecha_hora)} {cita.cliente?.nombre}
                    </div>
                  ))}
                  {dayCitas.length > 3 && (
                    <p className="text-[10px] text-muted-foreground pl-1">+{dayCitas.length - 3} más</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-lg font-semibold capitalize">{getDateRangeLabel()}</h2>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="day" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Día</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="gap-1">
                  <CalendarRange className="h-4 w-4" />
                  <span className="hidden sm:inline">Semana</span>
                </TabsTrigger>
                <TabsTrigger value="month" className="gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Mes</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "day" && <DayView />}
          {viewMode === "week" && <WeekView />}
          {viewMode === "month" && <MonthView />}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa de la cita agendada</DialogDescription>
          </DialogHeader>
          {selectedCita && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedCita.cliente?.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha y Hora</p>
                  <p>{formatDateTime(selectedCita.fecha_hora)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Servicios</p>
                <div className="space-y-2">
                  {selectedCita.subservicios?.map((cs) => (
                    <div key={cs.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                      <span>{cs.subservicio?.nombre}</span>
                      <span className="font-medium">{formatPrice(cs.precio_pyg)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{formatPrice(selectedCita.monto_total_pyg)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la cita de <span className="font-medium">{selectedCita?.cliente?.nombre}</span> como
              cancelada. Podrás restaurarla posteriormente si lo necesitas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? "Cancelando..." : "Sí, cancelar cita"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {selectedCita && (
        <EditCitaDialog
          cita={selectedCita}
          clientes={clientes}
          servicios={servicios}
          plantillas={plantillas}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  )
}

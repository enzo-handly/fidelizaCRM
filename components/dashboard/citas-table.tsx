"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditCitaDialog } from "./edit-cita-dialog"
import type { Cita, Cliente, Servicio, Subservicio, PlantillaMensaje } from "@/lib/types"
import { MoreHorizontal, Pencil, XCircle, Search, Calendar, Bell, CheckCircle, RotateCcw, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { cancelCita, restoreCita } from "@/app/actions/citas"

interface ServicioWithSubservicios extends Servicio {
  subservicios: Subservicio[]
}

interface CitasTableProps {
  citas: Cita[]
  clientes: Cliente[]
  servicios: ServicioWithSubservicios[]
  plantillas: PlantillaMensaje[]
}

export function CitasTable({ citas, clientes, servicios, plantillas }: CitasTableProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("activas")
  const router = useRouter()

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const filteredCitas = citas.filter((cita) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      cita.cliente?.nombre.toLowerCase().includes(query) ||
      cita.subservicios?.some((cs) => cs.subservicio?.nombre.toLowerCase().includes(query))

    const matchesStatus =
      statusFilter === "todas" ||
      (statusFilter === "activas" && !cita.fue_cancelado) ||
      (statusFilter === "canceladas" && cita.fue_cancelado)

    return matchesSearch && matchesStatus
  })

  const isPastAppointment = (fechaHora: string) => {
    return new Date(fechaHora) < new Date()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todas las Citas</CardTitle>
              <CardDescription>
                {filteredCitas.length} cita{filteredCitas.length !== 1 ? "s" : ""}{" "}
                {statusFilter === "activas" ? "activa" : statusFilter === "canceladas" ? "cancelada" : ""}
                {filteredCitas.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="activas">Activas</SelectItem>
                  <SelectItem value="canceladas">Canceladas</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicios</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Monto Total</TableHead>
                <TableHead>Recordatorio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCitas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchQuery || statusFilter !== "todas" ? "No se encontraron citas" : "No hay citas agendadas"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCitas.map((cita) => {
                  const isPast = isPastAppointment(cita.fecha_hora)

                  return (
                    <TableRow key={cita.id} className={cita.fue_cancelado ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="font-medium">{cita.cliente?.nombre || "Cliente eliminado"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {cita.subservicios?.slice(0, 2).map((cs) => (
                            <Badge key={cs.id} variant="secondary" className="text-xs">
                              {cs.subservicio?.nombre}
                            </Badge>
                          ))}
                          {(cita.subservicios?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(cita.subservicios?.length || 0) - 2} más
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={isPast && !cita.fue_cancelado ? "text-muted-foreground" : ""}>
                          {formatDateTime(cita.fecha_hora)}
                        </span>
                        {isPast && !cita.fue_cancelado && (
                          <Badge variant="outline" className="ml-2 text-xs border-muted-foreground/30">
                            Pasada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(cita.monto_total_pyg)}</TableCell>
                      <TableCell>
                        {cita.enviar_recordatorio ? (
                          <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                            <Bell className="mr-1 h-3 w-3" />
                            Activo
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {cita.fue_cancelado ? (
                          <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
                            <XCircle className="mr-1 h-3 w-3" />
                            Cancelada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Activa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCita(cita)
                                setDetailsDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            {!cita.fue_cancelado && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCita(cita)
                                  setEditDialogOpen(true)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {cita.fue_cancelado ? (
                              <DropdownMenuItem onClick={() => handleRestore(cita)} disabled={isProcessing}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Restaurar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCita(cita)
                                  setCancelDialogOpen(true)
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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

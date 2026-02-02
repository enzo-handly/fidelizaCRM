"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Cliente, Cita } from "@/lib/types"
import { getCitasByCliente } from "@/app/actions/citas"
import { Calendar, Clock, DollarSign } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ClienteCitasDialogProps {
  cliente: Cliente
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClienteCitasDialog({ cliente, open, onOpenChange }: ClienteCitasDialogProps) {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadCitas()
    }
  }, [open, cliente.id])

  const loadCitas = async () => {
    setLoading(true)
    const data = await getCitasByCliente(cliente.id)
    setCitas(data)
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Citas de {cliente.nombre}
          </DialogTitle>
          <DialogDescription>
            Historial completo de citas ordenadas por fecha
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : citas.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p className="text-lg font-medium">Sin citas registradas</p>
            <p className="text-sm">Este cliente aún no tiene citas agendadas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Servicios</TableHead>
                    <TableHead className="text-right">Monto Total</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {citas.map((cita) => (
                    <TableRow key={cita.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(cita.fecha_hora)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(cita.fecha_hora)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {cita.subservicios && cita.subservicios.length > 0 ? (
                            cita.subservicios.map((cs) => (
                              <Badge key={cs.id} variant="secondary" className="w-fit">
                                {cs.subservicio?.nombre || "Servicio"}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin servicios</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 font-semibold">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {formatPrice(cita.monto_total_pyg)}
                        </div>
                        {cita.subservicios && cita.subservicios.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {cita.subservicios.length} servicio{cita.subservicios.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {cita.fue_cancelado ? (
                          <Badge variant="destructive">Cancelada</Badge>
                        ) : new Date(cita.fecha_hora) < new Date() ? (
                          <Badge variant="outline" className="border-green-600 text-green-600">
                            Completada
                          </Badge>
                        ) : (
                          <Badge variant="default">Programada</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
              <div>
                <p className="text-sm font-medium">Total de Citas</p>
                <p className="text-2xl font-bold">{citas.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-right">Monto Total Acumulado</p>
                <p className="text-2xl font-bold text-right">
                  {formatPrice(citas.reduce((sum, cita) => sum + cita.monto_total_pyg, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

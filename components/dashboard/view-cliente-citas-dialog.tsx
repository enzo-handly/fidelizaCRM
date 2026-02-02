"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClienteCitas } from "@/app/actions/clientes"
import type { Cita, Cliente } from "@/lib/types"
import { Calendar, AlertCircle, Loader2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils/formatters"

interface ViewClienteCitasDialogProps {
  cliente: Cliente | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewClienteCitasDialog({ cliente, open, onOpenChange }: ViewClienteCitasDialogProps) {
  const [citas, setCitas] = useState<Cita[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && cliente) {
      loadCitas()
    } else {
      // Reset state when dialog closes
      setCitas([])
      setError(null)
    }
  }, [open, cliente])

  const loadCitas = async () => {
    if (!cliente) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getClienteCitas(cliente.id)

      if (result.success) {
        setCitas(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError("Error inesperado al cargar las citas")
    } finally {
      setIsLoading(false)
    }
  }

  const getSubserviciosText = (cita: Cita): string => {
    if (!cita.subservicios || cita.subservicios.length === 0) {
      return "Sin subservicios"
    }

    return cita.subservicios
      .map((cs) => cs.subservicio?.nombre || "Desconocido")
      .join(", ")
  }

  const getTotalSubservicios = (cita: Cita): number => {
    return cita.subservicios?.length || 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-none w-[95vw] h-[90vh] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6" />
            Historial de Citas - {cliente?.nombre}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Todas las citas registradas para este cliente, ordenadas desde la más antigua
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-6 min-h-0">
          {isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Cargando citas...</span>
            </div>
          )}

          {error && (
            <div className="py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {!isLoading && !error && citas.length === 0 && (
            <div className="py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Este cliente no tiene citas registradas aún.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!isLoading && !error && citas.length > 0 && (
            <div className="flex-1 flex flex-col overflow-hidden py-4 min-h-0">
              <div className="flex-1 rounded-md border overflow-hidden flex flex-col min-h-0">
                <div className="overflow-auto flex-1 min-h-0">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[12%] bg-muted/50">Fecha</TableHead>
                        <TableHead className="w-[40%] bg-muted/50">Subservicios Realizados</TableHead>
                        <TableHead className="w-[12%] text-center bg-muted/50">Cantidad</TableHead>
                        <TableHead className="w-[18%] text-right bg-muted/50">Monto Total</TableHead>
                        <TableHead className="w-[18%] text-center bg-muted/50">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {citas.map((cita) => (
                        <TableRow key={cita.id}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {formatDate(cita.fecha_hora)}
                          </TableCell>
                          <TableCell>
                            <p className="text-sm leading-relaxed">{getSubserviciosText(cita)}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-semibold">
                              {getTotalSubservicios(cita)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-base">
                            {formatCurrency(cita.monto_total_pyg)}
                          </TableCell>
                          <TableCell className="text-center">
                            {cita.fue_cancelado ? (
                              <Badge variant="destructive">Cancelada</Badge>
                            ) : (
                              <Badge variant="default">Completada</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Summary Footer */}
                <div className="border-t bg-muted/50 p-5 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <div className="text-base text-muted-foreground">
                      Total de citas: <span className="font-bold text-foreground text-lg">{citas.length}</span>
                    </div>
                    <div className="text-base font-medium">
                      Total acumulado:{" "}
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(
                          citas
                            .filter((c) => !c.fue_cancelado)
                            .reduce((sum, cita) => sum + cita.monto_total_pyg, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

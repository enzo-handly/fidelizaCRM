"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Send } from "lucide-react"
import type { ClienteConEstadisticas, PlantillaMensaje } from "@/lib/types"
import { createBulkRecordatorios } from "@/app/actions/recordatorios"
import { toast } from "sonner"
import { localToUtc } from "@/lib/utils/timezone"

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedClientes: ClienteConEstadisticas[]
  plantillas: PlantillaMensaje[]
  onSuccess: () => void
}

export function SendMessageDialog({
  open,
  onOpenChange,
  selectedClientes,
  plantillas,
  onSuccess,
}: SendMessageDialogProps) {
  const [plantillaId, setPlantillaId] = useState<string>("")
  const [fechaHora, setFechaHora] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!plantillaId || !fechaHora) {
      toast.error("Completa todos los campos")
      return
    }

    if (selectedClientes.length === 0) {
      toast.error("No hay clientes seleccionados")
      return
    }

    setIsSubmitting(true)

    try {
      const clienteIds = selectedClientes.map((c) => c.id)
      
      const result = await createBulkRecordatorios({
        clienteIds,
        plantillaId,
        fechaHora: localToUtc(fechaHora),
      })

      if (result.success) {
        toast.success(
          `Se programaron ${result.data?.count || 0} recordatorios exitosamente`
        )
        onOpenChange(false)
        onSuccess()
        // Reset form
        setPlantillaId("")
        setFechaHora("")
      } else {
        toast.error(result.error || "Error al programar recordatorios")
      }
    } catch (error) {
      toast.error("Error inesperado al programar recordatorios")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum datetime (current time)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // At least 5 minutes from now
    return now.toISOString().slice(0, 16)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Programar Recordatorios Masivos
          </DialogTitle>
          <DialogDescription>
            Se programarán recordatorios para {selectedClientes.length} cliente
            {selectedClientes.length !== 1 ? "s" : ""} seleccionado
            {selectedClientes.length !== 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Plantilla Selection */}
            <div className="space-y-2">
              <Label htmlFor="plantilla">Plantilla de Mensaje *</Label>
              <Select value={plantillaId} onValueChange={setPlantillaId}>
                <SelectTrigger id="plantilla">
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {plantillas.map((plantilla) => (
                    <SelectItem key={plantilla.id} value={plantilla.id}>
                      {plantilla.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha y Hora */}
            <DateTimePicker
              value={fechaHora}
              onChange={setFechaHora}
              label="Fecha y Hora de Envío"
              required
              minDate={new Date().toISOString().split('T')[0]}
              description="Programa cuándo se enviarán los recordatorios"
            />

            {/* Selected Clients Preview */}
            <div className="space-y-2">
              <Label>Clientes Seleccionados ({selectedClientes.length})</Label>
              <div className="max-h-32 overflow-y-auto rounded-md border p-2 text-sm">
                {selectedClientes.slice(0, 10).map((cliente) => (
                  <div
                    key={cliente.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span>{cliente.nombre}</span>
                    {cliente.contacto && (
                      <span className="text-muted-foreground">
                        {cliente.contacto}
                      </span>
                    )}
                  </div>
                ))}
                {selectedClientes.length > 10 && (
                  <div className="pt-1 text-center text-muted-foreground">
                    ... y {selectedClientes.length - 10} más
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Programando...</>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar Recordatorios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

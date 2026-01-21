"use client"

import type React from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { updateCita } from "@/app/actions/citas"
import type { Cita, Cliente, Servicio, Subservicio, PlantillaMensaje } from "@/lib/types"
import { useDialogForm, useClientSearch, useServiceSelection, usePriceFormatter } from "@/lib/hooks"

interface ServicioWithSubservicios extends Servicio {
  subservicios: Subservicio[]
}

interface EditCitaDialogProps {
  cita: Cita
  clientes: Cliente[]
  servicios: ServicioWithSubservicios[]
  plantillas: PlantillaMensaje[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCitaDialog({ cita, clientes, servicios, plantillas, open, onOpenChange }: EditCitaDialogProps) {
  const { formatPrice } = usePriceFormatter()

  // Prepare initial form data from cita
  const initialFormData = useMemo(() => {
    const fechaLocal = new Date(cita.fecha_hora)
    const offset = fechaLocal.getTimezoneOffset()
    const localDate = new Date(fechaLocal.getTime() - offset * 60 * 1000)

    return {
      cliente_id: cita.cliente_id,
      fecha_hora: localDate.toISOString().slice(0, 16),
      enviar_recordatorio: cita.enviar_recordatorio,
    }
  }, [cita])

  // Initial selected subservicios
  const initialSubservicios = useMemo(() => {
    return cita.subservicios?.map((cs) => cs.subservicio_id) || []
  }, [cita])

  // Dialog form management
  const { formData, setFormData, isLoading, error, handleSubmit: handleFormSubmit } = useDialogForm({
    onSubmit: async (data) => {
      return updateCita(cita.id, {
        cliente_id: data.cliente_id,
        fecha_hora: new Date(data.fecha_hora).toISOString(),
        subservicio_ids: selectedSubservicios,
      })
    },
    onSuccess: () => onOpenChange(false),
    initialData: initialFormData,
    resetOnSuccess: false, // Don't reset on edit
  })

  // Cliente search combobox
  const { ClientSearchCombobox } = useClientSearch({
    clientes,
    onSelect: (clienteId) => setFormData({ ...formData, cliente_id: clienteId }),
  })

  // Service/subservice selection with initial values
  const {
    selectedSubservicios,
    ServiceAccordion,
    SelectedItemsSummary,
  } = useServiceSelection({ 
    servicios,
    initialSelected: initialSubservicios,
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cita</DialogTitle>
          <DialogDescription>Modifica los detalles de la cita.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <div className="grid gap-4 py-4">
            {/* Cliente */}
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <ClientSearchCombobox />
            </div>

            {/* Fecha y Hora */}
            <div className="grid gap-2">
              <Label htmlFor="fecha_hora">Fecha y Hora</Label>
              <Input
                id="fecha_hora"
                type="datetime-local"
                value={formData.fecha_hora}
                onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                required
              />
            </div>

            {/* Servicios */}
            <div className="grid gap-2">
              <Label>Servicios</Label>
              <ServiceAccordion />
              <SelectedItemsSummary />
            </div>

            {/* Recordatorio */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enviar_recordatorio"
                checked={formData.enviar_recordatorio}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enviar_recordatorio: checked as boolean })
                }
              />
              <Label htmlFor="enviar_recordatorio" className="cursor-pointer">
                Enviar recordatorio por WhatsApp
              </Label>
            </div>

            {/* Error display */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.cliente_id || !formData.fecha_hora || selectedSubservicios.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

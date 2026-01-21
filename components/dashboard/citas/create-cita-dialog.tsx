"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import { createCita } from "@/app/actions/citas"
import type { Cliente, Servicio, Subservicio, PlantillaMensaje } from "@/lib/types"
import { useDialogForm, useClientSearch, useServiceSelection, usePriceFormatter } from "@/lib/hooks"

interface ServicioWithSubservicios extends Servicio {
  subservicios: Subservicio[]
}

interface CreateCitaDialogProps {
  clientes: Cliente[]
  servicios: ServicioWithSubservicios[]
  plantillas: PlantillaMensaje[]
}

interface CitaFormData {
  cliente_id: string
  fecha_hora: string
  enviar_recordatorio: boolean
  plantilla_id: string
}

export function CreateCitaDialog({ clientes, servicios, plantillas }: CreateCitaDialogProps) {
  const [open, setOpen] = useState(false)
  const { formatPrice } = usePriceFormatter()

  // Dialog form management
  const { formData, setFormData, isLoading, error, handleSubmit: handleFormSubmit } = useDialogForm<CitaFormData>({
    onSubmit: async (data) => {
      return createCita({
        cliente_id: data.cliente_id,
        fecha_hora: new Date(data.fecha_hora).toISOString(),
        subservicio_ids: selectedSubservicios,
        enviar_recordatorio: data.enviar_recordatorio,
        // Note: plantilla_id not currently used by backend
      })
    },
    onSuccess: () => {
      setOpen(false)
      clearSelection() // Clear selected services
    },
    initialData: {
      cliente_id: "",
      fecha_hora: "",
      enviar_recordatorio: false,
      plantilla_id: "",
    },
  })

  // Cliente search combobox
  const { ClientSearchCombobox } = useClientSearch({
    clientes,
    onSelect: (clienteId) => setFormData({ ...formData, cliente_id: clienteId }),
  })

  // Service/subservice selection
  const {
    selectedSubservicios,
    calculateTotal,
    clearSelection,
    ServiceAccordion,
    SelectedItemsSummary,
  } = useServiceSelection({ servicios })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar Nueva Cita</DialogTitle>
          <DialogDescription>Crea una nueva cita seleccionando el cliente y los servicios.</DialogDescription>
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
            <div className="space-y-3">
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

              {formData.enviar_recordatorio && (
                <div className="grid gap-2 pl-6">
                  <Label htmlFor="plantilla">Plantilla de Mensaje</Label>
                  <Select
                    value={formData.plantilla_id}
                    onValueChange={(value) => setFormData({ ...formData, plantilla_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plantilla..." />
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
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.cliente_id ||
                !formData.fecha_hora ||
                selectedSubservicios.length === 0 ||
                (formData.enviar_recordatorio && !formData.plantilla_id)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Cita"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

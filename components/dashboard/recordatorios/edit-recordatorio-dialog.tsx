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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateRecordatorio } from "@/app/actions/recordatorios"
import type { Recordatorio, Cliente, PlantillaMensaje } from "@/lib/types"
import { useDialogForm, useClientSearch } from "@/lib/hooks"

interface EditRecordatorioDialogProps {
  recordatorio: Recordatorio
  clientes: Cliente[]
  plantillas: PlantillaMensaje[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditRecordatorioDialog({
  recordatorio,
  clientes,
  plantillas,
  open,
  onOpenChange,
}: EditRecordatorioDialogProps) {
  const initialFormData = useMemo(() => {
    const date = new Date(recordatorio.fecha_hora)
    const formattedDate = date.toISOString().slice(0, 16)
    return {
      cliente_id: recordatorio.cliente_id,
      plantilla_id: recordatorio.plantilla_id,
      fecha_hora: formattedDate,
      telefono_destino: recordatorio.telefono_destino,
      estado: recordatorio.estado,
    }
  }, [recordatorio])

  const { formData, setFormData, isLoading, error, handleSubmit } = useDialogForm({
    initialData: initialFormData,
    onSubmit: async (data) => {
      return await updateRecordatorio(recordatorio.id, {
        ...data,
        fecha_hora: new Date(data.fecha_hora).toISOString(),
        estado: data.estado as "pendiente" | "enviado" | "fallido",
      })
    },
    onSuccess: () => onOpenChange(false),
  })

  const { ClientSearchCombobox } = useClientSearch({
    clientes,
    initialValue: formData.cliente_id,
    onSelect: (clienteId) => {
      setFormData((prev) => ({
        ...prev,
        cliente_id: clienteId,
      }))
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Recordatorio</DialogTitle>
          <DialogDescription>Modifica los detalles del recordatorio programado.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <ClientSearchCombobox />
            </div>

            <div className="grid gap-2">
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

            <div className="grid gap-2">
              <Label htmlFor="telefono_destino">Teléfono de Destino</Label>
              <Input
                id="telefono_destino"
                type="tel"
                placeholder="+595991234567"
                value={formData.telefono_destino}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telefono_destino: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fecha_hora">Fecha y Hora de Envío</Label>
              <Input
                id="fecha_hora"
                type="datetime-local"
                value={formData.fecha_hora}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fecha_hora: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    estado: value as "pendiente" | "enviado" | "fallido",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="fallido">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.cliente_id ||
                !formData.plantilla_id ||
                !formData.fecha_hora ||
                !formData.telefono_destino
              }
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { createRecordatorio } from "@/app/actions/recordatorios"
import type { Cliente, PlantillaMensaje } from "@/lib/types"
import { useDialogForm, useClientSearch } from "@/lib/hooks"

interface CreateRecordatorioDialogProps {
  clientes: Cliente[]
  plantillas: PlantillaMensaje[]
}

export function CreateRecordatorioDialog({ clientes, plantillas }: CreateRecordatorioDialogProps) {
  const [open, setOpen] = useState(false)

  const { formData, setFormData, isLoading, error, handleSubmit } = useDialogForm({
    initialData: {
      cliente_id: "",
      plantilla_id: "",
      fecha_hora: "",
      telefono_destino: "",
    },
    onSubmit: async (data) => {
      return await createRecordatorio({
        ...data,
        fecha_hora: new Date(data.fecha_hora).toISOString(),
      })
    },
    onSuccess: () => setOpen(false),
  })

  const { selectedCliente, ClientSearchCombobox } = useClientSearch({
    clientes,
    selectedClienteId: formData.cliente_id,
    onSelect: (clienteId) => {
      const cliente = clientes.find((c) => c.id === clienteId)
      setFormData({
        ...formData,
        cliente_id: clienteId,
        telefono_destino: cliente?.contacto || formData.telefono_destino,
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Recordatorio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Recordatorio</DialogTitle>
          <DialogDescription>Programa un nuevo recordatorio para enviar a un cliente.</DialogDescription>
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
              <p className="text-xs text-muted-foreground">Incluye el código de país (ej: +595 para Paraguay)</p>
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
          </div>

          {error && <p className="text-sm text-destructive mb-4">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
              {isLoading ? "Creando..." : "Crear Recordatorio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

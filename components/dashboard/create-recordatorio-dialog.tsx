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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Check, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { createRecordatorio } from "@/app/actions/recordatorios"
import { cn } from "@/lib/utils"
import type { Cliente, PlantillaMensaje } from "@/lib/types"

interface CreateRecordatorioDialogProps {
  clientes: Cliente[]
  plantillas: PlantillaMensaje[]
}

export function CreateRecordatorioDialog({ clientes, plantillas }: CreateRecordatorioDialogProps) {
  const [open, setOpen] = useState(false)
  const [clienteOpen, setClienteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    cliente_id: "",
    plantilla_id: "",
    fecha_hora: "",
    telefono_destino: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await createRecordatorio({
      cliente_id: formData.cliente_id,
      plantilla_id: formData.plantilla_id,
      fecha_hora: new Date(formData.fecha_hora).toISOString(),
      telefono_destino: formData.telefono_destino,
    })

    if (result.success) {
      setOpen(false)
      setFormData({
        cliente_id: "",
        plantilla_id: "",
        fecha_hora: "",
        telefono_destino: "",
      })
      router.refresh()
    } else {
      alert(result.error || "Error al crear recordatorio")
    }

    setIsLoading(false)
  }

  const selectedCliente = clientes.find((c) => c.id === formData.cliente_id)

  // Auto-fill phone when client is selected
  const handleClienteSelect = (clienteId: string) => {
    const cliente = clientes.find((c) => c.id === clienteId)
    setFormData((prev) => ({
      ...prev,
      cliente_id: clienteId,
      telefono_destino: cliente?.contacto || prev.telefono_destino,
    }))
    setClienteOpen(false)
  }

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
              <Popover open={clienteOpen} onOpenChange={setClienteOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clienteOpen}
                    className="justify-between w-full font-normal bg-transparent"
                  >
                    {selectedCliente ? selectedCliente.nombre : "Seleccionar cliente..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                      <CommandGroup>
                        {clientes.map((cliente) => (
                          <CommandItem
                            key={cliente.id}
                            value={cliente.nombre}
                            onSelect={() => handleClienteSelect(cliente.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.cliente_id === cliente.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{cliente.nombre}</span>
                              {cliente.contacto && (
                                <span className="text-xs text-muted-foreground">{cliente.contacto}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="plantilla">Plantilla de Mensaje</Label>
              <Select
                value={formData.plantilla_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, plantilla_id: value }))}
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
                  setFormData((prev) => ({
                    ...prev,
                    telefono_destino: e.target.value,
                  }))
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
                  setFormData((prev) => ({
                    ...prev,
                    fecha_hora: e.target.value,
                  }))
                }
                required
              />
            </div>
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

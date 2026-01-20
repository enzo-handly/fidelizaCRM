"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { updateCita } from "@/app/actions/citas"
import { cn } from "@/lib/utils"
import type { Cita, Cliente, Servicio, Subservicio, PlantillaMensaje } from "@/lib/types"

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
  const [clienteOpen, setClienteOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubservicios, setSelectedSubservicios] = useState<string[]>([])
  const [formData, setFormData] = useState({
    cliente_id: "",
    fecha_hora: "",
    enviar_recordatorio: false,
  })
  const router = useRouter()

  useEffect(() => {
    if (cita) {
      const fechaLocal = new Date(cita.fecha_hora)
      const offset = fechaLocal.getTimezoneOffset()
      const localDate = new Date(fechaLocal.getTime() - offset * 60 * 1000)

      setFormData({
        cliente_id: cita.cliente_id,
        fecha_hora: localDate.toISOString().slice(0, 16),
        enviar_recordatorio: cita.enviar_recordatorio,
      })
      setSelectedSubservicios(cita.subservicios?.map((cs) => cs.subservicio_id) || [])
    }
  }, [cita])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await updateCita(cita.id, {
      cliente_id: formData.cliente_id,
      fecha_hora: new Date(formData.fecha_hora).toISOString(),
      subservicio_ids: selectedSubservicios,
      enviar_recordatorio: formData.enviar_recordatorio,
    })

    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      alert(result.error || "Error al actualizar cita")
    }

    setIsLoading(false)
  }

  const selectedCliente = clientes.find((c) => c.id === formData.cliente_id)

  const toggleSubservicio = (subservicioId: string) => {
    setSelectedSubservicios((prev) =>
      prev.includes(subservicioId) ? prev.filter((id) => id !== subservicioId) : [...prev, subservicioId],
    )
  }

  const getSubservicioById = (id: string): Subservicio | undefined => {
    for (const servicio of servicios) {
      const sub = servicio.subservicios?.find((s) => s.id === id)
      if (sub) return sub
    }
    return undefined
  }

  const calculateTotal = () => {
    return selectedSubservicios.reduce((sum, id) => {
      const sub = getSubservicioById(id)
      return sum + (sub?.precio_pyg || 0)
    }, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cita</DialogTitle>
          <DialogDescription>Modifica los detalles de la cita.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Cliente */}
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
                <PopoverContent className="w-[550px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                      <CommandGroup>
                        {clientes.map((cliente) => (
                          <CommandItem
                            key={cliente.id}
                            value={cliente.nombre}
                            onSelect={() => {
                              setFormData((prev) => ({
                                ...prev,
                                cliente_id: cliente.id,
                              }))
                              setClienteOpen(false)
                            }}
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

            {/* Fecha y Hora */}
            <div className="grid gap-2">
              <Label htmlFor="fecha_hora">Fecha y Hora</Label>
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

            {/* Servicios */}
            <div className="grid gap-2">
              <Label>Servicios</Label>
              <Accordion type="multiple" className="w-full">
                {servicios.map((servicio) => (
                  <AccordionItem key={servicio.id} value={servicio.id}>
                    <AccordionTrigger className="text-sm">
                      {servicio.nombre}
                      {servicio.subservicios?.some((s) => selectedSubservicios.includes(s.id)) && (
                        <Badge variant="secondary" className="ml-2">
                          {servicio.subservicios.filter((s) => selectedSubservicios.includes(s.id)).length} seleccionado
                          {servicio.subservicios.filter((s) => selectedSubservicios.includes(s.id)).length !== 1
                            ? "s"
                            : ""}
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-2">
                        {servicio.subservicios
                          ?.filter((s) => !s.deleted_at)
                          .map((subservicio) => (
                            <div
                              key={subservicio.id}
                              className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                              onClick={() => toggleSubservicio(subservicio.id)}
                            >
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={selectedSubservicios.includes(subservicio.id)}
                                  onCheckedChange={() => toggleSubservicio(subservicio.id)}
                                />
                                <span className="text-sm">{subservicio.nombre}</span>
                              </div>
                              <span className="text-sm font-medium">{formatPrice(subservicio.precio_pyg)}</span>
                            </div>
                          ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Selected services summary */}
              {selectedSubservicios.length > 0 && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedSubservicios.map((id) => {
                      const sub = getSubservicioById(id)
                      return sub ? (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          {sub.nombre}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => toggleSubservicio(id)} />
                        </Badge>
                      ) : null
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recordatorio */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enviar_recordatorio"
                checked={formData.enviar_recordatorio}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    enviar_recordatorio: checked as boolean,
                  }))
                }
              />
              <Label htmlFor="enviar_recordatorio" className="cursor-pointer">
                Enviar recordatorio por WhatsApp
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.cliente_id || !formData.fecha_hora || selectedSubservicios.length === 0}
            >
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

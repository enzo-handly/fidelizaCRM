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
import { Switch } from "@/components/ui/switch"
import { Plus, Loader2 } from "lucide-react"
import { createCliente } from "@/app/actions/clientes"
import { useDialogForm } from "@/lib/hooks"

export function CreateClienteDialog() {
  const [open, setOpen] = useState(false)

  const { formData, setFormData, isLoading, error, handleSubmit } = useDialogForm({
    onSubmit: (data) => createCliente({
      nombre: data.nombre,
      contacto: data.contacto || undefined,
      email: data.email || undefined,
      es_menor: data.es_menor,
      nombre_responsable: data.nombre_responsable || undefined,
      sexo: data.sexo || undefined,
    }),
    onSuccess: () => setOpen(false),
    initialData: {
      nombre: "",
      contacto: "",
      email: "",
      es_menor: false,
      nombre_responsable: "",
      sexo: "" as "masculino" | "femenino" | "otro" | "",
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo cliente para registrarlo en el sistema.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Nombre completo"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contacto">Teléfono de Contacto</Label>
              <Input
                id="contacto"
                placeholder="+595 981 123456"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select
                value={formData.sexo}
                onValueChange={(value: "masculino" | "femenino" | "otro") => setFormData({ ...formData, sexo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="es_menor">¿Es menor de edad?</Label>
                <p className="text-xs text-muted-foreground">Marcar si el cliente es menor de edad</p>
              </div>
              <Switch
                id="es_menor"
                checked={formData.es_menor}
                onCheckedChange={(checked) => setFormData({ ...formData, es_menor: checked })}
              />
            </div>
            {formData.es_menor && (
              <div className="grid gap-2">
                <Label htmlFor="nombre_responsable">Nombre del Responsable *</Label>
                <Input
                  id="nombre_responsable"
                  placeholder="Nombre del padre/madre/tutor"
                  required={formData.es_menor}
                  value={formData.nombre_responsable}
                  onChange={(e) => setFormData({ ...formData, nombre_responsable: e.target.value })}
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

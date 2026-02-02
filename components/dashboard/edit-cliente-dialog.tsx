"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { updateCliente } from "@/app/actions/clientes"
import type { Cliente } from "@/lib/types"

interface EditClienteDialogProps {
  cliente: Cliente
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditClienteDialog({ cliente, open, onOpenChange }: EditClienteDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    nombre: cliente.nombre,
    contacto: cliente.contacto || "",
    email: cliente.email || "",
    es_menor: cliente.es_menor,
    nombre_responsable: cliente.nombre_responsable || "",
    sexo: cliente.sexo || ("" as "masculino" | "femenino" | "otro" | ""),
  })

  useEffect(() => {
    setFormData({
      nombre: cliente.nombre,
      contacto: cliente.contacto || "",
      email: cliente.email || "",
      es_menor: cliente.es_menor,
      nombre_responsable: cliente.nombre_responsable || "",
      sexo: cliente.sexo || "",
    })
  }, [cliente])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await updateCliente(cliente.id, {
      nombre: formData.nombre,
      contacto: formData.contacto || undefined,
      email: formData.email || undefined,
      es_menor: formData.es_menor,
      nombre_responsable: formData.nombre_responsable || undefined,
      sexo: formData.sexo || null,
    })

    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      setError(result.error || "Error al actualizar cliente")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>Actualiza los datos del cliente {cliente.nombre}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_nombre">Nombre *</Label>
              <Input
                id="edit_nombre"
                placeholder="Nombre completo"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_contacto">Teléfono de Contacto</Label>
              <Input
                id="edit_contacto"
                placeholder="+595 981 123456"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_sexo">Sexo</Label>
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
                <Label htmlFor="edit_es_menor">¿Es menor de edad?</Label>
                <p className="text-xs text-muted-foreground">Marcar si el cliente es menor de edad</p>
              </div>
              <Switch
                id="edit_es_menor"
                checked={formData.es_menor}
                onCheckedChange={(checked) => setFormData({ ...formData, es_menor: checked })}
              />
            </div>
            {formData.es_menor && (
              <div className="grid gap-2">
                <Label htmlFor="edit_nombre_responsable">Nombre del Responsable *</Label>
                <Input
                  id="edit_nombre_responsable"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
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

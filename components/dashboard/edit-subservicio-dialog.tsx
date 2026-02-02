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
import { Loader2 } from "lucide-react"
import { updateSubservicio } from "@/app/actions/servicios"
import type { Subservicio, Servicio } from "@/lib/types"

interface EditSubservicioDialogProps {
  subservicio: Subservicio
  servicios: Servicio[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSubservicioDialog({ subservicio, servicios, open, onOpenChange }: EditSubservicioDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PY").format(price)
  }

  const [formData, setFormData] = useState({
    servicio_id: subservicio.servicio_id,
    nombre: subservicio.nombre,
    precio_pyg: formatPrice(subservicio.precio_pyg),
  })

  useEffect(() => {
    setFormData({
      servicio_id: subservicio.servicio_id,
      nombre: subservicio.nombre,
      precio_pyg: formatPrice(subservicio.precio_pyg),
    })
    setError(null)
  }, [subservicio])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const precio = Number.parseInt(formData.precio_pyg.replace(/\D/g, ""), 10) || 0

    const result = await updateSubservicio(subservicio.id, {
      servicio_id: formData.servicio_id,
      nombre: formData.nombre,
      precio_pyg: precio,
    })

    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      setError(result.error || "Error al actualizar subservicio")
    }

    setIsLoading(false)
  }

  const formatPriceInput = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (!numbers) return ""
    return new Intl.NumberFormat("es-PY").format(Number.parseInt(numbers, 10))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Subservicio</DialogTitle>
          <DialogDescription>Modifica los datos del subservicio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="servicio_id">Categoría *</Label>
              <Select
                value={formData.servicio_id}
                onValueChange={(value) => setFormData({ ...formData, servicio_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((servicio) => (
                    <SelectItem key={servicio.id} value={servicio.id}>
                      {servicio.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre del Subservicio *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Manicura clásica"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="precio_pyg">Precio (PYG) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">₲</span>
                <Input
                  id="precio_pyg"
                  placeholder="50.000"
                  required
                  className="pl-8 font-mono"
                  value={formData.precio_pyg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      precio_pyg: formatPriceInput(e.target.value),
                    })
                  }
                />
              </div>
            </div>
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

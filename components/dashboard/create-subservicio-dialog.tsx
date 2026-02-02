"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, Loader2 } from "lucide-react"
import { createSubservicio } from "@/app/actions/servicios"
import type { Servicio } from "@/lib/types"

interface CreateSubservicioDialogProps {
  servicios: Servicio[]
  defaultServicioId?: string
}

export function CreateSubservicioDialog({ servicios, defaultServicioId }: CreateSubservicioDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    servicio_id: defaultServicioId || "",
    nombre: "",
    precio_pyg: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const precio = Number.parseInt(formData.precio_pyg.replace(/\D/g, ""), 10) || 0

    const result = await createSubservicio({
      servicio_id: formData.servicio_id,
      nombre: formData.nombre,
      precio_pyg: precio,
    })

    if (result.success) {
      setOpen(false)
      setFormData({
        servicio_id: defaultServicioId || "",
        nombre: "",
        precio_pyg: "",
      })
      router.refresh()
    } else {
      setError(result.error || "Error al crear subservicio")
    }

    setIsLoading(false)
  }

  const formatPriceInput = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (!numbers) return ""
    return new Intl.NumberFormat("es-PY").format(Number.parseInt(numbers, 10))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Subservicio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Subservicio</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo subservicio facturable.</DialogDescription>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.servicio_id}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Subservicio"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

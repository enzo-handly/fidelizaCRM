"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Paperclip, X, Info } from "lucide-react"
import { createPlantilla, uploadAttachment } from "@/app/actions/plantillas"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const AVAILABLE_VARIABLES = [
  { name: "NombreCliente", description: "Nombre del cliente" },
  { name: "Servicio", description: "Nombre del servicio" },
  { name: "Fecha", description: "Fecha del agendamiento" },
]

export function CreatePlantillaDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    titulo: "",
    cuerpo: "",
    adjunto_url: "",
    adjunto_nombre: "",
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    const result = await uploadAttachment(formDataUpload)

    if (result.success && result.url) {
      setFormData({
        ...formData,
        adjunto_url: result.url,
        adjunto_nombre: result.fileName || file.name,
      })
    } else {
      setError(result.error || "Error al subir archivo")
    }

    setIsUploading(false)
  }

  const removeAttachment = () => {
    setFormData({
      ...formData,
      adjunto_url: "",
      adjunto_nombre: "",
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`
    setFormData({
      ...formData,
      cuerpo: formData.cuerpo + variable,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await createPlantilla({
      titulo: formData.titulo,
      cuerpo: formData.cuerpo,
      adjunto_url: formData.adjunto_url || undefined,
      adjunto_nombre: formData.adjunto_nombre || undefined,
    })

    if (result.success) {
      setOpen(false)
      setFormData({
        titulo: "",
        cuerpo: "",
        adjunto_url: "",
        adjunto_nombre: "",
      })
      router.refresh()
    } else {
      setError(result.error || "Error al crear plantilla")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Plantilla</DialogTitle>
          <DialogDescription>
            Crea una plantilla de mensaje reutilizable. Usa variables para personalizar el contenido.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                placeholder="Ej: Recordatorio de cita"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cuerpo">Cuerpo del Mensaje *</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p>Usa variables como {"{{NombreCliente}}"} para personalizar el mensaje automáticamente.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="cuerpo"
                placeholder="Escribe el contenido del mensaje aquí..."
                required
                rows={5}
                value={formData.cuerpo}
                onChange={(e) => setFormData({ ...formData, cuerpo: e.target.value })}
              />
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground mr-1">Variables:</span>
                {AVAILABLE_VARIABLES.map((variable) => (
                  <TooltipProvider key={variable.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-muted font-mono text-xs"
                          onClick={() => insertVariable(variable.name)}
                        >
                          {`{{${variable.name}}}`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{variable.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Adjunto (opcional)</Label>
              {formData.adjunto_url ? (
                <div className="flex items-center gap-2 rounded-md border p-3">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{formData.adjunto_nombre}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={removeAttachment}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Plantilla"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Paperclip, X, Info } from "lucide-react"
import { updatePlantilla, uploadAttachment, deleteAttachment } from "@/app/actions/plantillas"
import type { PlantillaMensaje } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EditPlantillaDialogProps {
  plantilla: PlantillaMensaje
  open: boolean
  onOpenChange: (open: boolean) => void
}

const AVAILABLE_VARIABLES = [
  { name: "NombreCliente", description: "Nombre del cliente" },
  { name: "Servicio", description: "Nombre del servicio" },
  { name: "Fecha", description: "Fecha del agendamiento" },
]

export function EditPlantillaDialog({ plantilla, open, onOpenChange }: EditPlantillaDialogProps) {
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

  useEffect(() => {
    if (plantilla) {
      setFormData({
        titulo: plantilla.titulo,
        cuerpo: plantilla.cuerpo,
        adjunto_url: plantilla.adjunto_url || "",
        adjunto_nombre: plantilla.adjunto_nombre || "",
      })
    }
  }, [plantilla])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    // Delete old attachment if exists
    if (formData.adjunto_url) {
      await deleteAttachment(formData.adjunto_url)
    }

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

  const removeAttachment = async () => {
    if (formData.adjunto_url) {
      setIsUploading(true)
      await deleteAttachment(formData.adjunto_url)
      setIsUploading(false)
    }
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

    const result = await updatePlantilla(plantilla.id, {
      titulo: formData.titulo,
      cuerpo: formData.cuerpo,
      adjunto_url: formData.adjunto_url || null,
      adjunto_nombre: formData.adjunto_nombre || null,
    })

    if (result.success) {
      onOpenChange(false)
      router.refresh()
    } else {
      setError(result.error || "Error al actualizar plantilla")
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Editar Plantilla</DialogTitle>
          <DialogDescription>Modifica los detalles de la plantilla de mensaje.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-titulo">Título *</Label>
              <Input
                id="edit-titulo"
                placeholder="Ej: Recordatorio de cita"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-cuerpo">Cuerpo del Mensaje *</Label>
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
                id="edit-cuerpo"
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={removeAttachment}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
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

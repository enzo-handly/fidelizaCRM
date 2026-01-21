"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { useDialogForm } from "@/lib/hooks"

const AVAILABLE_VARIABLES = [
  { name: "NombreCliente", description: "Nombre del cliente" },
  { name: "Servicio", description: "Nombre del servicio" },
  { name: "Fecha", description: "Fecha del agendamiento" },
]

export function CreatePlantillaDialog() {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { formData, setFormData, isLoading, error, handleSubmit } = useDialogForm({
    initialData: {
      titulo: "",
      cuerpo: "",
      adjunto_url: "",
      adjunto_nombre: "",
    },
    onSubmit: async (data) => {
      return await createPlantilla({
        titulo: data.titulo,
        cuerpo: data.cuerpo,
        adjunto_url: data.adjunto_url || undefined,
        adjunto_nombre: data.adjunto_nombre || undefined,
      })
    },
    onSuccess: () => setOpen(false),
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    const result = await uploadAttachment(formDataUpload)

    if (result.success && result.data) {
      setFormData((prev) => ({
        ...prev,
        adjunto_url: result.data.url,
        adjunto_nombre: result.data.fileName || file.name,
      }))
    } else {
      setUploadError(!result.success ? (result.error || "Error al subir archivo") : "Error al subir archivo")
    }

    setIsUploading(false)
  }

  const removeAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      adjunto_url: "",
      adjunto_nombre: "",
    }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const insertVariable = (variableName: string) => {
    const variable = `{{${variableName}}}`
    setFormData((prev) => ({
      ...prev,
      cuerpo: prev.cuerpo + variable,
    }))
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
                onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
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
                onChange={(e) => setFormData((prev) => ({ ...prev, cuerpo: e.target.value }))}
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

            {(error || uploadError) && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error || uploadError}</p>}
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

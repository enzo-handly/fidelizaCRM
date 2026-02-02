"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EditPlantillaDialog } from "./edit-plantilla-dialog"
import type { PlantillaMensaje } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Search, Copy, Paperclip, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { deletePlantilla, duplicatePlantilla } from "@/app/actions/plantillas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlantillasTableProps {
  plantillas: PlantillaMensaje[]
}

// Variable highlighting helper
function highlightVariables(text: string) {
  const variableRegex = /\{\{(\w+)\}\}/g
  const parts = text.split(variableRegex)

  return parts.map((part, index) => {
    // Odd indexes are the captured groups (variable names)
    if (index % 2 === 1) {
      return (
        <Badge key={index} variant="secondary" className="mx-0.5 font-mono text-xs">
          {`{{${part}}}`}
        </Badge>
      )
    }
    return part
  })
}

export function PlantillasTable({ plantillas }: PlantillasTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaMensaje | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    if (!selectedPlantilla) return
    setIsDeleting(true)

    const result = await deletePlantilla(selectedPlantilla.id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al eliminar plantilla")
    }

    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setSelectedPlantilla(null)
  }

  const handleDuplicate = async (plantilla: PlantillaMensaje) => {
    setIsDuplicating(true)

    const result = await duplicatePlantilla(plantilla.id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al duplicar plantilla")
    }

    setIsDuplicating(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const truncateText = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const filteredPlantillas = plantillas.filter((plantilla) => {
    const query = searchQuery.toLowerCase()
    return plantilla.titulo.toLowerCase().includes(query) || plantilla.cuerpo.toLowerCase().includes(query)
  })

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todas las Plantillas</CardTitle>
              <CardDescription>
                {filteredPlantillas.length} plantilla
                {filteredPlantillas.length !== 1 ? "s" : ""} registrada
                {filteredPlantillas.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar plantilla..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="w-[40%]">Cuerpo</TableHead>
                <TableHead>Adjunto</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlantillas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No se encontraron plantillas" : "No hay plantillas registradas"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlantillas.map((plantilla) => (
                  <TableRow key={plantilla.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{plantilla.titulo}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {highlightVariables(truncateText(plantilla.cuerpo))}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-sm whitespace-pre-wrap">
                            {highlightVariables(plantilla.cuerpo)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {plantilla.adjunto_url ? (
                        <a
                          href={plantilla.adjunto_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          {plantilla.adjunto_nombre || "Ver adjunto"}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(plantilla.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlantilla(plantilla)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(plantilla)} disabled={isDuplicating}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlantilla(plantilla)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la plantilla <span className="font-medium">{selectedPlantilla?.titulo}</span>. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedPlantilla && (
        <EditPlantillaDialog plantilla={selectedPlantilla} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      )}
    </>
  )
}

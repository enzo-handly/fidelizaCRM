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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog"
import { TableSearch } from "@/components/ui/table-search"
import { EditPlantillaDialog } from "./edit-plantilla-dialog"
import type { PlantillaMensaje } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Copy, Paperclip, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { deletePlantilla, duplicatePlantilla } from "@/app/actions/plantillas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTableActions, useTableSearch } from "@/lib/hooks"

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
  const { deleteDialogOpen, editDialogOpen, selectedItem, isDeleting, handleDelete, openEdit, openDelete, closeAll } =
    useTableActions({
      onDelete: deletePlantilla,
    })

  const { searchQuery, setSearchQuery, filteredItems } = useTableSearch({
    items: plantillas,
    searchableFields: ["titulo", "cuerpo"],
  })

  const [isDuplicating, setIsDuplicating] = useState(false)
  const router = useRouter()

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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todas las Plantillas</CardTitle>
              <CardDescription>
                {filteredItems.length} plantilla
                {filteredItems.length !== 1 ? "s" : ""} registrada
                {filteredItems.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <TableSearch 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Buscar plantilla..." 
              className="w-full sm:w-64 pl-8"
            />
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
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No se encontraron plantillas" : "No hay plantillas registradas"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((plantilla) => (
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
                          <DropdownMenuItem onClick={() => openEdit(plantilla)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(plantilla)} disabled={isDuplicating}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDelete(plantilla)} className="text-destructive focus:text-destructive">
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

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={closeAll}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        description={
          <>
            Esta acción eliminará la plantilla <span className="font-medium">{selectedItem?.titulo}</span>. Esta
            acción no se puede deshacer.
          </>
        }
      />

      {selectedItem && (
        <EditPlantillaDialog plantilla={selectedItem} open={editDialogOpen} onOpenChange={closeAll} />
      )}
    </>
  )
}

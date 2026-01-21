"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog"
import { TableSearch } from "@/components/ui/table-search"
import { EditSubservicioDialog } from "./edit-subservicio-dialog"
import type { Subservicio, Servicio } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { deleteSubservicio } from "@/app/actions/servicios"
import { useTableActions, useTableSearch, usePriceFormatter } from "@/lib/hooks"

interface SubserviciosTableProps {
  subservicios: Subservicio[]
  servicios: Servicio[]
}

export function SubserviciosTable({ subservicios, servicios }: SubserviciosTableProps) {
  const { formatPrice } = usePriceFormatter()
  
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedItem: selectedSubservicio,
    isDeleting,
    handleDelete,
    openEdit,
    openDelete,
  } = useTableActions<Subservicio>({
    onDelete: deleteSubservicio,
  })

  const { searchQuery, setSearchQuery, filteredItems: filteredSubservicios } = useTableSearch({
    items: subservicios,
    searchableFields: ["nombre"],
  })

  return (
    <>
      <div className="mb-4">
        <TableSearch 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Buscar subservicio..." 
          className="w-full sm:w-64 pl-8"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="text-right">Precio (PYG)</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSubservicios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                {searchQuery
                  ? "No se encontraron subservicios"
                  : "No hay subservicios en esta categoría. Crea uno nuevo."}
              </TableCell>
            </TableRow>
          ) : (
            filteredSubservicios.map((subservicio) => (
              <TableRow key={subservicio.id}>
                <TableCell className="font-medium">{subservicio.nombre}</TableCell>
                <TableCell className="text-right font-mono">{formatPrice(subservicio.precio_pyg)}</TableCell>
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
                        onClick={() => openEdit(subservicio)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openDelete(subservicio)}
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

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        description={
          <>
            Esta acción eliminará el subservicio <span className="font-medium">{selectedSubservicio?.nombre}</span>.
            Esta acción no se puede deshacer.
          </>
        }
      />

      {selectedSubservicio && (
        <EditSubservicioDialog
          subservicio={selectedSubservicio}
          servicios={servicios}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  )
}

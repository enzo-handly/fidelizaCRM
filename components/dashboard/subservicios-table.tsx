"use client"

import { useState } from "react"
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
import { EditSubservicioDialog } from "./edit-subservicio-dialog"
import type { Subservicio, Servicio } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteSubservicio } from "@/app/actions/servicios"

interface SubserviciosTableProps {
  subservicios: Subservicio[]
  servicios: Servicio[]
}

export function SubserviciosTable({ subservicios, servicios }: SubserviciosTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedSubservicio, setSelectedSubservicio] = useState<Subservicio | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    if (!selectedSubservicio) return
    setIsDeleting(true)

    const result = await deleteSubservicio(selectedSubservicio.id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al eliminar subservicio")
    }

    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setSelectedSubservicio(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const filteredSubservicios = subservicios.filter((subservicio) => {
    const query = searchQuery.toLowerCase()
    return subservicio.nombre.toLowerCase().includes(query)
  })

  return (
    <>
      <div className="mb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar subservicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
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
                        onClick={() => {
                          setSelectedSubservicio(subservicio)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedSubservicio(subservicio)
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el subservicio <span className="font-medium">{selectedSubservicio?.nombre}</span>.
              Esta acción no se puede deshacer.
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

"use client"

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
import { EditClienteDialog } from "./edit-cliente-dialog"
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog"
import { TableSearch } from "@/components/ui/table-search"
import type { Cliente } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, UserCircle, Baby } from "lucide-react"
import { deleteCliente } from "@/app/actions/clientes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTableActions, useTableSearch } from "@/lib/hooks"

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedItem: selectedCliente,
    isDeleting,
    handleDelete,
    openEdit,
    openDelete,
  } = useTableActions<Cliente>({
    onDelete: deleteCliente,
  })

  const { searchQuery, setSearchQuery, filteredItems: filteredClientes } = useTableSearch({
    items: clientes,
    searchableFields: ["nombre", "email", "contacto"],
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getSexoLabel = (sexo: string | null) => {
    switch (sexo) {
      case "masculino":
        return "M"
      case "femenino":
        return "F"
      case "otro":
        return "O"
      default:
        return "-"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todos los Clientes</CardTitle>
              <CardDescription>
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""} registrado
                {filteredClientes.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <TableSearch 
              value={searchQuery} 
              onChange={setSearchQuery} 
              placeholder="Buscar cliente..." 
              className="w-full sm:w-64 pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No se encontraron clientes" : "No hay clientes registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {cliente.nombre[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{cliente.nombre}</p>
                          {cliente.email && <p className="text-sm text-muted-foreground">{cliente.email}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{cliente.contacto || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getSexoLabel(cliente.sexo)}</Badge>
                    </TableCell>
                    <TableCell>
                      {cliente.es_menor ? (
                        <Badge variant="secondary" className="gap-1">
                          <Baby className="h-3 w-3" />
                          Menor
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <UserCircle className="h-3 w-3" />
                          Adulto
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(cliente.created_at)}</TableCell>
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
                          <DropdownMenuItem onClick={() => openEdit(cliente)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDelete(cliente)}
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

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        description={
          <>
            Esta acción eliminará al cliente <span className="font-medium">{selectedCliente?.nombre}</span>. Esta
            acción no se puede deshacer.
          </>
        }
      />

      {selectedCliente && (
        <EditClienteDialog cliente={selectedCliente} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      )}
    </>
  )
}

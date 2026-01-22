"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditClienteDialog } from "./edit-cliente-dialog"
import { ViewClienteCitasDialog } from "./view-cliente-citas-dialog"
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog"
import { TableSearch } from "@/components/ui/table-search"
import type { ClienteConEstadisticas } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, UserCircle, Baby, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { deleteCliente } from "@/app/actions/clientes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTableActions, useTableSearch, useTableSort } from "@/lib/hooks"
import { formatClienteStats, getSexoLabel } from "@/lib/utils/cliente-formatters"

interface ClientesTableProps {
  clientes: ClienteConEstadisticas[]
}

type SortField = 'nombre' | 'total_facturado' | 'cantidad_citas' | 'monto_promedio' | 'ultima_visita' | 'created_at'

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [citasDialogOpen, setCitasDialogOpen] = useState(false)
  const [selectedClienteForCitas, setSelectedClienteForCitas] = useState<ClienteConEstadisticas | null>(null)
  
  // Use custom hooks for separation of concerns
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
  } = useTableActions<ClienteConEstadisticas>({
    onDelete: deleteCliente,
  })

  const { searchQuery, setSearchQuery, filteredItems } = useTableSearch({
    items: clientes,
    searchableFields: ["nombre", "email", "contacto"],
  })

  const { sortedItems, sortField, sortDirection, handleSort } = useTableSort<ClienteConEstadisticas>({
    items: filteredItems,
  })

  const openCitas = (cliente: ClienteConEstadisticas) => {
    setSelectedClienteForCitas(cliente)
    setCitasDialogOpen(true)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todos los Clientes</CardTitle>
              <CardDescription>
                {sortedItems.length} cliente{sortedItems.length !== 1 ? "s" : ""} registrado
                {sortedItems.length !== 1 ? "s" : ""}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 lg:px-3 hover:bg-accent"
                      onClick={() => handleSort('total_facturado')}
                    >
                      Total Facturado
                      {getSortIcon('total_facturado')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 lg:px-3 hover:bg-accent"
                      onClick={() => handleSort('cantidad_citas')}
                    >
                      Citas
                      {getSortIcon('cantidad_citas')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 lg:px-3 hover:bg-accent"
                      onClick={() => handleSort('monto_promedio')}
                    >
                      Promedio
                      {getSortIcon('monto_promedio')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 lg:px-3 hover:bg-accent"
                      onClick={() => handleSort('ultima_visita')}
                    >
                      Última Visita
                      {getSortIcon('ultima_visita')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "No se encontraron clientes" : "No hay clientes registrados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedItems.map((cliente) => (
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
                      <TableCell>
                        <span className="font-medium">
                          {formatClienteStats.totalFacturado(cliente.total_facturado)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatClienteStats.cantidadCitas(cliente.cantidad_citas)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {formatClienteStats.montoPromedio(cliente.monto_promedio)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatClienteStats.ultimaVisita(cliente.ultima_visita)}
                        </span>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => openCitas(cliente)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Ver Citas
                            </DropdownMenuItem>
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
          </div>
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

      <ViewClienteCitasDialog
        cliente={selectedClienteForCitas}
        open={citasDialogOpen}
        onOpenChange={setCitasDialogOpen}
      />
    </>
  )
}

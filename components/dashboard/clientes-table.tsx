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
import { EditClienteDialog } from "./edit-cliente-dialog"
import type { Cliente } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Search, UserCircle, Baby } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteCliente } from "@/app/actions/clientes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    if (!selectedCliente) return
    setIsDeleting(true)

    const result = await deleteCliente(selectedCliente.id)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al eliminar cliente")
    }

    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setSelectedCliente(null)
  }

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

  const filteredClientes = clientes.filter((cliente) => {
    const query = searchQuery.toLowerCase()
    return (
      cliente.nombre.toLowerCase().includes(query) ||
      cliente.email?.toLowerCase().includes(query) ||
      cliente.contacto?.toLowerCase().includes(query)
    )
  })

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
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCliente(cliente)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCliente(cliente)
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
              Esta acción eliminará al cliente <span className="font-medium">{selectedCliente?.nombre}</span>. Esta
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

      {selectedCliente && (
        <EditClienteDialog cliente={selectedCliente} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
      )}
    </>
  )
}

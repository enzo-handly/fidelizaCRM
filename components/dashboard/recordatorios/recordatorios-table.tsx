"use client"

import { useState, useMemo } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog"
import { TableSearch } from "@/components/ui/table-search"
import { EditRecordatorioDialog } from "./edit-recordatorio-dialog"
import type { Recordatorio, Cliente, PlantillaMensaje } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Bell, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import { deleteRecordatorio } from "@/app/actions/recordatorios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTableActions, useTableSearch } from "@/lib/hooks"

interface RecordatoriosTableProps {
  recordatorios: Recordatorio[]
  clientes: Cliente[]
  plantillas: PlantillaMensaje[]
}

const estadoConfig = {
  pendiente: {
    label: "Pendiente",
    variant: "outline" as const,
    icon: Clock,
    className: "border-yellow-500 text-yellow-600 bg-yellow-50",
  },
  enviado: {
    label: "Enviado",
    variant: "outline" as const,
    icon: CheckCircle,
    className: "border-green-500 text-green-600 bg-green-50",
  },
  fallido: {
    label: "Fallido",
    variant: "outline" as const,
    icon: XCircle,
    className: "border-red-500 text-red-600 bg-red-50",
  },
}

export function RecordatoriosTable({ recordatorios, clientes, plantillas }: RecordatoriosTableProps) {
  const { deleteDialogOpen, editDialogOpen, selectedItem, isDeleting, handleDelete, openEdit, openDelete, closeAll } =
    useTableActions<Recordatorio>({
      onDelete: deleteRecordatorio,
    })

  const { searchQuery, setSearchQuery, filteredItems: searchFilteredItems } = useTableSearch({
    items: recordatorios,
    searchableFields: ["telefono_destino"],
    customFilter: (item, query) => {
      const clienteNombre = item.cliente?.nombre?.toLowerCase() || ""
      const plantillaTitulo = item.plantilla?.titulo?.toLowerCase() || ""
      const telefono = item.telefono_destino.toLowerCase()
      return clienteNombre.includes(query) || plantillaTitulo.includes(query) || telefono.includes(query)
    },
  })

  const [jsonDialogOpen, setJsonDialogOpen] = useState(false)
  const [jsonRecordatorio, setJsonRecordatorio] = useState<Recordatorio | null>(null)
  const [jsonType, setJsonType] = useState<"payload" | "response">("payload")
  const [estadoFilter, setEstadoFilter] = useState<string>("todos")

  // Apply estado filter on top of search filter
  const filteredRecordatorios = useMemo(() => {
    return searchFilteredItems.filter((recordatorio) => {
      return estadoFilter === "todos" || recordatorio.estado === estadoFilter
    })
  }, [searchFilteredItems, estadoFilter])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const showJsonDialog = (recordatorio: Recordatorio, type: "payload" | "response") => {
    setJsonRecordatorio(recordatorio)
    setJsonType(type)
    setJsonDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Todos los Recordatorios</CardTitle>
              <CardDescription>
                {filteredRecordatorios.length} recordatorio
                {filteredRecordatorios.length !== 1 ? "s" : ""} programado
                {filteredRecordatorios.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="fallido">Fallido</SelectItem>
                </SelectContent>
              </Select>
              <TableSearch 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder="Buscar recordatorio..." 
                className="w-full sm:w-64 pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plantilla</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>WAHA</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecordatorios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {searchQuery || estadoFilter !== "todos"
                      ? "No se encontraron recordatorios"
                      : "No hay recordatorios programados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecordatorios.map((recordatorio) => {
                  const estado = estadoConfig[recordatorio.estado]
                  const EstadoIcon = estado.icon

                  return (
                    <TableRow key={recordatorio.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="font-medium">{recordatorio.cliente?.nombre || "Cliente eliminado"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{recordatorio.plantilla?.titulo || "Plantilla eliminada"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{recordatorio.telefono_destino}</span>
                      </TableCell>
                      <TableCell>{formatDateTime(recordatorio.fecha_hora)}</TableCell>
                      <TableCell>
                        <Badge variant={estado.variant} className={estado.className}>
                          <EstadoIcon className="mr-1 h-3 w-3" />
                          {estado.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {recordatorio.waha_payload && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showJsonDialog(recordatorio, "payload")}
                              className="h-7 px-2 text-xs"
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Payload
                            </Button>
                          )}
                          {recordatorio.waha_response && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showJsonDialog(recordatorio, "response")}
                              className="h-7 px-2 text-xs"
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Response
                            </Button>
                          )}
                          {!recordatorio.waha_payload && !recordatorio.waha_response && (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
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
                            <DropdownMenuItem onClick={() => openEdit(recordatorio)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDelete(recordatorio)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
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
            Esta acción eliminará el recordatorio para{" "}
            <span className="font-medium">{selectedItem?.cliente?.nombre}</span>. Esta acción no se puede
            deshacer.
          </>
        }
      />

      <Dialog open={jsonDialogOpen} onOpenChange={setJsonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{jsonType === "payload" ? "WAHA Payload" : "WAHA Response"}</DialogTitle>
            <DialogDescription>
              {jsonType === "payload" ? "Datos enviados a la API de WAHA" : "Respuesta recibida de la API de WAHA"}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4 overflow-auto max-h-96">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {jsonRecordatorio &&
                JSON.stringify(
                  jsonType === "payload" ? jsonRecordatorio.waha_payload : jsonRecordatorio.waha_response,
                  null,
                  2,
                )}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {selectedItem && (
        <EditRecordatorioDialog
          recordatorio={selectedItem}
          clientes={clientes}
          plantillas={plantillas}
          open={editDialogOpen}
          onOpenChange={closeAll}
        />
      )}
    </>
  )
}

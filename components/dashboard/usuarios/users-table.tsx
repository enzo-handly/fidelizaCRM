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
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog"
import { EditUserDialog } from "./edit-user-dialog"
import type { Profile } from "@/lib/types"
import { MoreHorizontal, Pencil, Trash2, Shield, User, UserCheck, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteUser, toggleUserActive } from "@/app/actions/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTableActions } from "@/lib/hooks"

interface UsersTableProps {
  users: Profile[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const { deleteDialogOpen, editDialogOpen, selectedItem, isDeleting, handleDelete, openEdit, openDelete, closeAll } =
    useTableActions({
      onDelete: deleteUser,
    })

  // Toggle dialog is custom to this table, not part of useTableActions
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false)
  const [toggleUser, setToggleUser] = useState<Profile | null>(null)
  const [isToggling, setIsToggling] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    if (!toggleUser) return
    setIsToggling(true)

    const result = await toggleUserActive(toggleUser.id, !toggleUser.activo)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al cambiar estado del usuario")
    }

    setIsToggling(false)
    setToggleDialogOpen(false)
    setToggleUser(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Todos los Usuarios</CardTitle>
          <CardDescription>Lista de todos los usuarios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className={!user.activo ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.full_name || "Sin nombre"}
                            {user.id === currentUserId && (
                              <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? (
                          <Shield className="mr-1 h-3 w-3" />
                        ) : (
                          <User className="mr-1 h-3 w-3" />
                        )}
                        {user.role === "admin" ? "Administrador" : "Usuario"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.activo ? "outline" : "destructive"}>
                        {user.activo ? (
                          <>
                            <UserCheck className="mr-1 h-3 w-3" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX className="mr-1 h-3 w-3" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
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
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {user.id !== currentUserId && (
                            <DropdownMenuItem
                              onClick={() => {
                                setToggleUser(user)
                                setToggleDialogOpen(true)
                              }}
                            >
                              {user.activo ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                          {user.id !== currentUserId && (
                            <DropdownMenuItem onClick={() => openDelete(user)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
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
        open={toggleDialogOpen}
        onOpenChange={setToggleDialogOpen}
        onConfirm={handleToggle}
        isDeleting={isToggling}
        title={toggleUser?.activo ? "¿Desactivar usuario?" : "¿Activar usuario?"}
        confirmText={toggleUser?.activo ? "Desactivar" : "Activar"}
        description={
          toggleUser?.activo
            ? `El usuario ${toggleUser?.email} no podrá acceder al sistema mientras esté desactivado.`
            : `El usuario ${toggleUser?.email} podrá volver a acceder al sistema.`
        }
      />

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={closeAll}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        description={
          <>
            Esto eliminará permanentemente la cuenta de usuario de{" "}
            <span className="font-medium">{selectedItem?.email}</span>. Esta acción no se puede deshacer.
          </>
        }
      />

      {selectedItem && <EditUserDialog user={selectedItem} open={editDialogOpen} onOpenChange={closeAll} />}
    </>
  )
}

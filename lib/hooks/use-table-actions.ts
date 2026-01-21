"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { TableActionsOptions, TableActionsReturn } from "./types"

/**
 * Hook for managing table CRUD actions (edit, delete)
 * 
 * Consolidates common patterns:
 * - Dialog state management (edit, delete)
 * - Selected item tracking
 * - Delete operation with loading state
 * - Router refresh on success
 * 
 * @example
 * ```tsx
 * const {
 *   deleteDialogOpen,
 *   editDialogOpen,
 *   selectedItem,
 *   isDeleting,
 *   handleDelete,
 *   openEdit,
 *   openDelete,
 *   closeAll
 * } = useTableActions({
 *   onDelete: deleteCliente,
 *   onDeleteSuccess: () => toast.success("Eliminado")
 * })
 * ```
 */
export function useTableActions<T extends { id: string }>({
  onDelete,
  onEdit,
  onDeleteSuccess,
}: TableActionsOptions<T>): TableActionsReturn<T> {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const closeAll = useCallback(() => {
    setDeleteDialogOpen(false)
    setEditDialogOpen(false)
    setSelectedItem(null)
  }, [])

  const openEdit = useCallback(
    (item: T) => {
      setSelectedItem(item)
      setEditDialogOpen(true)
      onEdit?.(item)
    },
    [onEdit]
  )

  const openDelete = useCallback((item: T) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }, [])

  const handleDelete = useCallback(async () => {
    if (!selectedItem) return

    setIsDeleting(true)

    try {
      const result = await onDelete(selectedItem.id)

      if (result.success) {
        // Refresh router cache
        router.refresh()

        // Close dialog and clear selection
        closeAll()

        // Call success callback
        onDeleteSuccess?.()
      } else {
        // You might want to show an error toast here
        alert(result.error || "Error al eliminar")
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setIsDeleting(false)
    }
  }, [selectedItem, onDelete, onDeleteSuccess, closeAll, router])

  return {
    deleteDialogOpen,
    setDeleteDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    selectedItem,
    setSelectedItem,
    isDeleting,
    handleDelete,
    openEdit,
    openDelete,
    closeAll,
  }
}

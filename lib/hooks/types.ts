/**
 * Shared types for hooks
 */

import type { ActionResult } from "@/lib/errors/error-handler"

/**
 * Options for useDialogForm hook
 */
export interface DialogFormOptions<T> {
  /** Server action to call on form submit */
  onSubmit: (data: T) => Promise<ActionResult<any>>
  /** Callback when submission succeeds */
  onSuccess?: () => void
  /** Initial form data */
  initialData?: Partial<T>
  /** Whether to reset form on success (default: true) */
  resetOnSuccess?: boolean
}

/**
 * Return type for useDialogForm hook
 */
export interface DialogFormReturn<T> {
  /** Current form data */
  formData: T
  /** Update form data */
  setFormData: React.Dispatch<React.SetStateAction<T>>
  /** Whether form is submitting */
  isLoading: boolean
  /** Current error message */
  error: string | null
  /** Handle form submission */
  handleSubmit: (e: React.FormEvent) => Promise<void>
  /** Reset form to initial state */
  resetForm: () => void
  /** Clear error message */
  clearError: () => void
}

/**
 * Options for useTableActions hook
 */
export interface TableActionsOptions<T> {
  /** Server action to call on delete */
  onDelete: (id: string) => Promise<ActionResult<void>>
  /** Callback when item is edited */
  onEdit?: (item: T) => void
  /** Callback when delete succeeds */
  onDeleteSuccess?: () => void
}

/**
 * Return type for useTableActions hook
 */
export interface TableActionsReturn<T> {
  /** Whether delete dialog is open */
  deleteDialogOpen: boolean
  /** Set delete dialog open state */
  setDeleteDialogOpen: (open: boolean) => void
  /** Whether edit dialog is open */
  editDialogOpen: boolean
  /** Set edit dialog open state */
  setEditDialogOpen: (open: boolean) => void
  /** Currently selected item */
  selectedItem: T | null
  /** Set selected item */
  setSelectedItem: (item: T | null) => void
  /** Whether delete is in progress */
  isDeleting: boolean
  /** Handle delete action */
  handleDelete: () => Promise<void>
  /** Open edit dialog for item */
  openEdit: (item: T) => void
  /** Open delete dialog for item */
  openDelete: (item: T) => void
  /** Close all dialogs and clear selection */
  closeAll: () => void
}

/**
 * Options for useTableSearch hook
 */
export interface TableSearchOptions<T> {
  /** Items to search through */
  items: T[]
  /** Fields to search in */
  searchableFields: (keyof T)[]
  /** Custom filter function (optional) */
  customFilter?: (item: T, query: string) => boolean
}

/**
 * Return type for useTableSearch hook
 */
export interface TableSearchReturn<T> {
  /** Current search query */
  searchQuery: string
  /** Set search query */
  setSearchQuery: (query: string) => void
  /** Filtered items based on search */
  filteredItems: T[]
  /** Clear search */
  clearSearch: () => void
}

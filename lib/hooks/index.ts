/**
 * Reusable hooks for FidelizaCRM
 */

export { useDialogForm } from "./use-dialog-form"
export { useTableActions } from "./use-table-actions"
export { usePriceFormatter } from "./use-price-formatter"
export { useTableSearch } from "./use-table-search"
export { useTableSort } from "./use-table-sort"
export { useClientSearch } from "./use-client-search"
export { useServiceSelection } from "./use-service-selection"

export type {
  DialogFormOptions,
  DialogFormReturn,
  TableActionsOptions,
  TableActionsReturn,
  TableSearchOptions,
  TableSearchReturn,
} from "./types"

export type {
  UseTableSortOptions,
  UseTableSortReturn,
  SortDirection,
} from "./use-table-sort"

"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Cliente } from "@/lib/types"

interface UseClientSearchOptions {
  /** List of clientes to search through */
  clientes: Cliente[]
  /** Callback when a cliente is selected */
  onSelect: (clienteId: string) => void
  /** Initial selected cliente ID */
  initialValue?: string
  /** Auto-fill phone number on selection (default: false) */
  autoFillPhone?: boolean
  /** Callback to set phone number (required if autoFillPhone is true) */
  onPhoneChange?: (phone: string) => void
}

interface UseClientSearchReturn {
  /** Whether the combobox is open */
  open: boolean
  /** Set combobox open state */
  setOpen: (open: boolean) => void
  /** Currently selected cliente */
  selectedCliente: Cliente | null
  /** Client search combobox component */
  ClientSearchCombobox: () => React.JSX.Element
}

/**
 * Hook for reusable client search combobox
 * 
 * Provides:
 * - Searchable cliente dropdown with Command palette
 * - Selected cliente tracking
 * - Optional auto-fill phone number
 * 
 * @example
 * ```tsx
 * const { selectedCliente, ClientSearchCombobox } = useClientSearch({
 *   clientes,
 *   onSelect: (id) => setFormData({ ...formData, cliente_id: id }),
 *   autoFillPhone: true,
 *   onPhoneChange: (phone) => setFormData({ ...formData, telefono: phone })
 * })
 * 
 * <ClientSearchCombobox />
 * ```
 */
export function useClientSearch({
  clientes,
  onSelect,
  initialValue = "",
  autoFillPhone = false,
  onPhoneChange,
}: UseClientSearchOptions): UseClientSearchReturn {
  const [open, setOpen] = useState(false)
  const [selectedClienteId, setSelectedClienteId] = useState<string>(initialValue)

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId) || null

  const handleSelect = (clienteId: string) => {
    setSelectedClienteId(clienteId)
    onSelect(clienteId)
    setOpen(false)

    // Auto-fill phone if enabled
    if (autoFillPhone && onPhoneChange) {
      const cliente = clientes.find((c) => c.id === clienteId)
      if (cliente?.contacto) {
        onPhoneChange(cliente.contacto)
      }
    }
  }

  const ClientSearchCombobox = () => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedCliente ? selectedCliente.nombre : "Seleccionar cliente..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandEmpty>No se encontraron clientes</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {clientes.map((cliente) => (
              <CommandItem
                key={cliente.id}
                value={`${cliente.nombre} ${cliente.contacto || ""} ${cliente.email || ""}`}
                onSelect={() => handleSelect(cliente.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedClienteId === cliente.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{cliente.nombre}</span>
                  {cliente.contacto && (
                    <span className="text-xs text-muted-foreground">{cliente.contacto}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )

  return {
    open,
    setOpen,
    selectedCliente,
    ClientSearchCombobox,
  }
}

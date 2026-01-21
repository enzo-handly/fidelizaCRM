"use client"

import { useState, useMemo, useCallback } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Servicio, Subservicio } from "@/lib/types"

interface ServicioWithSubservicios extends Servicio {
  subservicios: Subservicio[]
}

interface UseServiceSelectionOptions {
  /** List of servicios with their subservicios */
  servicios: ServicioWithSubservicios[]
  /** Initial selected subservicio IDs (for edit mode) */
  initialSelected?: string[]
}

interface UseServiceSelectionReturn {
  /** Array of selected subservicio IDs */
  selectedSubservicios: string[]
  /** Toggle a subservicio selection */
  toggleSubservicio: (subservicioId: string) => void
  /** Calculate total price of selected subservicios */
  calculateTotal: () => number
  /** Get subservicio by ID */
  getSubservicioById: (id: string) => Subservicio | undefined
  /** Clear all selections */
  clearSelection: () => void
  /** Remove specific subservicio from selection */
  removeSubservicio: (id: string) => void
  /** Service accordion component with checkboxes */
  ServiceAccordion: () => React.JSX.Element
  /** Selected items summary badges */
  SelectedItemsSummary: () => React.JSX.Element
}

/**
 * Hook for managing service/subservice selection in cita forms
 * 
 * Provides:
 * - Multi-select subservicio management
 * - Price calculation
 * - Accordion UI with checkboxes
 * - Summary badges with remove functionality
 * 
 * @example
 * ```tsx
 * const {
 *   selectedSubservicios,
 *   calculateTotal,
 *   ServiceAccordion,
 *   SelectedItemsSummary
 * } = useServiceSelection({ servicios })
 * 
 * <ServiceAccordion />
 * <SelectedItemsSummary />
 * <p>Total: {formatPrice(calculateTotal())}</p>
 * ```
 */
export function useServiceSelection({
  servicios,
  initialSelected = [],
}: UseServiceSelectionOptions): UseServiceSelectionReturn {
  const [selectedSubservicios, setSelectedSubservicios] = useState<string[]>(initialSelected)

  const toggleSubservicio = useCallback((subservicioId: string) => {
    setSelectedSubservicios((prev) =>
      prev.includes(subservicioId) ? prev.filter((id) => id !== subservicioId) : [...prev, subservicioId]
    )
  }, [])

  const removeSubservicio = useCallback((id: string) => {
    setSelectedSubservicios((prev) => prev.filter((subId) => subId !== id))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedSubservicios([])
  }, [])

  const getSubservicioById = useCallback(
    (id: string): Subservicio | undefined => {
      for (const servicio of servicios) {
        const sub = servicio.subservicios?.find((s) => s.id === id)
        if (sub) return sub
      }
      return undefined
    },
    [servicios]
  )

  const calculateTotal = useCallback(() => {
    return selectedSubservicios.reduce((sum, id) => {
      const sub = getSubservicioById(id)
      return sum + (sub?.precio_pyg || 0)
    }, 0)
  }, [selectedSubservicios, getSubservicioById])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Count selected per service
  const selectedCountPerService = useMemo(() => {
    const counts: Record<string, number> = {}
    selectedSubservicios.forEach((subId) => {
      const servicio = servicios.find((s) => s.subservicios?.some((sub) => sub.id === subId))
      if (servicio) {
        counts[servicio.id] = (counts[servicio.id] || 0) + 1
      }
    })
    return counts
  }, [selectedSubservicios, servicios])

  const ServiceAccordion = () => (
    <Accordion type="single" collapsible className="w-full">
      {servicios.map((servicio) => {
        const selectedCount = selectedCountPerService[servicio.id] || 0

        return (
          <AccordionItem key={servicio.id} value={servicio.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-medium">{servicio.nombre}</span>
                {selectedCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedCount} seleccionado{selectedCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {servicio.subservicios && servicio.subservicios.length > 0 ? (
                  servicio.subservicios.map((subservicio) => {
                    const isSelected = selectedSubservicios.includes(subservicio.id)

                    return (
                      <div
                        key={subservicio.id}
                        className="flex items-center justify-between p-3 rounded-md hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => toggleSubservicio(subservicio.id)}
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox checked={isSelected} onCheckedChange={() => toggleSubservicio(subservicio.id)} />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{subservicio.nombre}</span>
                            <span className="text-xs text-muted-foreground">{formatPrice(subservicio.precio_pyg)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay subservicios disponibles
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )

  const SelectedItemsSummary = () => {
    if (selectedSubservicios.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-4">
          No has seleccionado ningún servicio aún
        </p>
      )
    }

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Servicios seleccionados:</p>
        <div className="flex flex-wrap gap-2">
          {selectedSubservicios.map((id) => {
            const subservicio = getSubservicioById(id)
            if (!subservicio) return null

            return (
              <Badge key={id} variant="secondary" className="gap-1">
                {subservicio.nombre}
                <button
                  type="button"
                  onClick={() => removeSubservicio(id)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-medium">Total:</span>
          <span className="text-lg font-bold">{formatPrice(calculateTotal())}</span>
        </div>
      </div>
    )
  }

  return {
    selectedSubservicios,
    toggleSubservicio,
    calculateTotal,
    getSubservicioById,
    clearSelection,
    removeSubservicio,
    ServiceAccordion,
    SelectedItemsSummary,
  }
}

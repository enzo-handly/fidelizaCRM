"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { DialogFormOptions, DialogFormReturn } from "./types"

/**
 * Hook for managing dialog form state and submission
 * 
 * Consolidates common patterns:
 * - Form data state management
 * - Loading and error states
 * - Form submission with server actions
 * - Router refresh on success
 * - Form reset functionality
 * 
 * @example
 * ```tsx
 * const { formData, setFormData, isLoading, error, handleSubmit, resetForm } = useDialogForm({
 *   onSubmit: createCliente,
 *   onSuccess: () => setOpen(false),
 *   initialData: { nombre: "", contacto: "" }
 * })
 * ```
 */
export function useDialogForm<T extends Record<string, any>>({
  onSubmit,
  onSuccess,
  initialData,
  resetOnSuccess = true,
}: DialogFormOptions<T>): DialogFormReturn<T> {
  const router = useRouter()
  const [formData, setFormData] = useState<T>(initialData as T)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setFormData(initialData as T)
    setError(null)
  }, [initialData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError(null)

      try {
        const result = await onSubmit(formData)

        if (result.success) {
          // Refresh router cache
          router.refresh()

          // Reset form if configured
          if (resetOnSuccess) {
            resetForm()
          }

          // Call success callback
          onSuccess?.()
        } else {
          setError(result.error || "Ocurrió un error inesperado")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al procesar la solicitud")
      } finally {
        setIsLoading(false)
      }
    },
    [formData, onSubmit, onSuccess, resetOnSuccess, resetForm, router]
  )

  return {
    formData,
    setFormData,
    isLoading,
    error,
    handleSubmit,
    resetForm,
    clearError,
  }
}

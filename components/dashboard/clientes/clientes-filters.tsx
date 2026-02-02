"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Filter } from "lucide-react"
import type { ClientesFilterOptions } from "@/lib/hooks"
import { Badge } from "@/components/ui/badge"

interface ClientesFiltersProps {
  filters: ClientesFilterOptions
  onFiltersChange: (filters: ClientesFilterOptions) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  totalClientes: number
  filteredCount: number
}

export function ClientesFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  totalClientes,
  filteredCount,
}: ClientesFiltersProps) {
  const handleFilterChange = (key: keyof ClientesFilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <div>
              <CardTitle>Filtros Avanzados</CardTitle>
              <CardDescription>
                {filteredCount} de {totalClientes} clientes
                {hasActiveFilters && " (filtrado)"}
              </CardDescription>
            </div>
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Facturado Range */}
          <div className="space-y-2">
            <Label>Total Facturado Mínimo</Label>
            <Input
              type="number"
              placeholder="₲ 0"
              value={filters.totalFacturadoMin ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "totalFacturadoMin",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Total Facturado Máximo</Label>
            <Input
              type="number"
              placeholder="₲ 999,999,999"
              value={filters.totalFacturadoMax ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "totalFacturadoMax",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            />
          </div>

          {/* Última Visita Range */}
          <div className="space-y-2">
            <Label>Última Visita Desde</Label>
            <Input
              type="date"
              value={filters.ultimaVisitaFrom ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "ultimaVisitaFrom",
                  e.target.value || undefined
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Última Visita Hasta</Label>
            <Input
              type="date"
              value={filters.ultimaVisitaTo ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "ultimaVisitaTo",
                  e.target.value || undefined
                )
              }
            />
          </div>

          {/* Es Menor */}
          <div className="space-y-2">
            <Label>Tipo de Cliente</Label>
            <Select
              value={
                filters.esMenor === undefined || filters.esMenor === null
                  ? "all"
                  : filters.esMenor
                  ? "menor"
                  : "adulto"
              }
              onValueChange={(value) =>
                handleFilterChange(
                  "esMenor",
                  value === "all" ? null : value === "menor"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="menor">Solo Menores</SelectItem>
                <SelectItem value="adulto">Solo Adultos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filters badges */}
          {hasActiveFilters && (
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <Label>Filtros Activos</Label>
              <div className="flex flex-wrap gap-2">
                {filters.totalFacturadoMin !== undefined && (
                  <Badge variant="secondary">
                    Mínimo: ₲ {filters.totalFacturadoMin.toLocaleString()}
                  </Badge>
                )}
                {filters.totalFacturadoMax !== undefined && (
                  <Badge variant="secondary">
                    Máximo: ₲ {filters.totalFacturadoMax.toLocaleString()}
                  </Badge>
                )}
                {filters.ultimaVisitaFrom && (
                  <Badge variant="secondary">
                    Desde: {new Date(filters.ultimaVisitaFrom).toLocaleDateString("es-ES")}
                  </Badge>
                )}
                {filters.ultimaVisitaTo && (
                  <Badge variant="secondary">
                    Hasta: {new Date(filters.ultimaVisitaTo).toLocaleDateString("es-ES")}
                  </Badge>
                )}
                {filters.esMenor !== undefined && filters.esMenor !== null && (
                  <Badge variant="secondary">
                    {filters.esMenor ? "Menores" : "Adultos"}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

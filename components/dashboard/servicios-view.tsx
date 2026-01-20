"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubserviciosTable } from "./subservicios-table"
import { CreateSubservicioDialog } from "./create-subservicio-dialog"
import type { Servicio, Subservicio } from "@/lib/types"
import { Scissors, Hand, Footprints, Baby } from "lucide-react"

interface ServiciosViewProps {
  servicios: Servicio[]
  subservicios: Subservicio[]
}

const servicioIcons: Record<string, React.ReactNode> = {
  Manicura: <Hand className="h-4 w-4" />,
  Pedicura: <Footprints className="h-4 w-4" />,
  Peluquería: <Scissors className="h-4 w-4" />,
  Niños: <Baby className="h-4 w-4" />,
}

export function ServiciosView({ servicios, subservicios }: ServiciosViewProps) {
  const [selectedServicio, setSelectedServicio] = useState<string>(servicios[0]?.id || "")

  const filteredSubservicios = subservicios.filter((sub) => sub.servicio_id === selectedServicio)

  const selectedServicioData = servicios.find((s) => s.id === selectedServicio)

  const getSubservicioCount = (servicioId: string) => {
    return subservicios.filter((s) => s.servicio_id === servicioId).length
  }

  if (servicios.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay categorías de servicios disponibles.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedServicio} onValueChange={setSelectedServicio}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 h-auto">
            {servicios.map((servicio) => (
              <TabsTrigger key={servicio.id} value={servicio.id} className="gap-2 px-4 py-2">
                {servicioIcons[servicio.nombre] || <Scissors className="h-4 w-4" />}
                <span className="hidden sm:inline">{servicio.nombre}</span>
                <span className="sm:hidden">{servicio.nombre.slice(0, 3)}</span>
                <span className="text-xs text-muted-foreground ml-1">({getSubservicioCount(servicio.id)})</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {selectedServicioData && (
            <CreateSubservicioDialog servicios={servicios} defaultServicioId={selectedServicio} />
          )}
        </div>

        {servicios.map((servicio) => (
          <TabsContent key={servicio.id} value={servicio.id} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {servicioIcons[servicio.nombre] || <Scissors className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle>{servicio.nombre}</CardTitle>
                    <CardDescription>
                      {getSubservicioCount(servicio.id)} subservicio
                      {getSubservicioCount(servicio.id) !== 1 ? "s" : ""} disponible
                      {getSubservicioCount(servicio.id) !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SubserviciosTable subservicios={filteredSubservicios} servicios={servicios} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

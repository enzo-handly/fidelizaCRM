"use client"

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface ChartDataPoint {
  date: string
  total: number
  label: string
}

interface DashboardChartProps {
  data: ChartDataPoint[]
}

export function DashboardChart({ data }: DashboardChartProps) {
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PY", {
      style: "currency",
      currency: "PYG",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <ChartContainer
      config={{
        total: {
          label: "Total Facturado",
          color: "hsl(var(--foreground))",
        },
      }}
      className="h-[350px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
              if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
              return value.toString()
            }}
            width={60}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const data = payload[0].payload as ChartDataPoint
              return (
                <div className="rounded-lg border bg-background p-3 shadow-md">
                  <p className="text-sm font-medium">{data.label}</p>
                  <p className="text-lg font-bold">{formatCurrency(data.total)}</p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            fill="url(#fillTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

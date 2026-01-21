"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TableSearch({ 
  value, 
  onChange, 
  placeholder = "Buscar...",
  className 
}: TableSearchProps) {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className || "pl-8"}
      />
    </div>
  )
}

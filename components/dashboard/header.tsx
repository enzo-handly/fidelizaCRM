"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Profile } from "@/lib/types"
import { LogOut, User, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserCircle, MessageSquareText, Bell, Briefcase, CalendarClock } from "lucide-react"

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const isAdmin = profile.role === "admin"

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, adminOnly: true },
    { title: "Clientes", href: "/dashboard/clientes", icon: UserCircle, adminOnly: false },
    { title: "Plantillas de Mensajes", href: "/dashboard/plantillas", icon: MessageSquareText, adminOnly: false },
    { title: "Recordatorios", href: "/dashboard/recordatorios", icon: Bell, adminOnly: false },
    { title: "Servicios", href: "/dashboard/servicios", icon: Briefcase, adminOnly: false },
    { title: "Agendamientos", href: "/dashboard/agendamientos", icon: CalendarClock, adminOnly: false },
    { title: "Usuarios", href: "/dashboard/usuarios", icon: Users, adminOnly: true },
  ]

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center gap-2 border-b px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground">
                <span className="text-sm font-bold text-background">FC</span>
              </div>
              <span className="text-lg font-bold">FidelizaCRM</span>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
            {/* User info in mobile menu */}
            <div className="border-t p-3">
              <div className="flex items-center gap-3 rounded-lg bg-accent/50 px-3 py-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                  {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{profile.full_name || profile.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
            <span className="text-xs font-bold text-background">FC</span>
          </div>
          <span className="text-base font-semibold">FidelizaCRM</span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
              {profile.full_name?.[0] || profile.email[0].toUpperCase()}
            </div>
            <span className="hidden md:inline-block">{profile.full_name || "Usuario"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{profile.full_name || "Usuario"}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground capitalize">Rol: {profile.role}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoading}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

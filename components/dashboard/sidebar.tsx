"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import {
  LayoutDashboard,
  Users,
  UserCircle,
  MessageSquareText,
  Bell,
  Briefcase,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DashboardSidebarProps {
  profile: Profile
}

export function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile.role === "admin"
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      adminOnly: true,
    },
    {
      title: "Clientes",
      href: "/dashboard/clientes",
      icon: UserCircle,
      adminOnly: false,
    },
    {
      title: "Plantillas de Mensajes",
      href: "/dashboard/plantillas",
      icon: MessageSquareText,
      adminOnly: false,
    },
    {
      title: "Recordatorios",
      href: "/dashboard/recordatorios",
      icon: Bell,
      adminOnly: false,
    },
    {
      title: "Servicios",
      href: "/dashboard/servicios",
      icon: Briefcase,
      adminOnly: false,
    },
    {
      title: "Agendamientos",
      href: "/dashboard/agendamientos",
      icon: CalendarClock,
      adminOnly: false,
    },
    {
      title: "Usuarios",
      href: "/dashboard/usuarios",
      icon: Users,
      adminOnly: true,
    },
  ]

  // Filter items based on role
  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden flex-col border-r bg-sidebar transition-all duration-300 lg:flex",
          isCollapsed ? "w-[72px]" : "w-64",
        )}
      >
        {/* Logo Section */}
        <div className={cn("flex h-16 items-center border-b px-4", isCollapsed ? "justify-center" : "justify-between")}>
          <div className={cn("flex items-center gap-2 overflow-hidden", isCollapsed && "justify-center")}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground">
              <span className="text-sm font-bold text-background">FC</span>
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">FidelizaCRM</span>
            )}
          </div>
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setIsCollapsed(true)}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Colapsar menú</span>
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="mb-2 h-10 w-full" onClick={() => setIsCollapsed(false)}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Expandir menú</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expandir menú</TooltipContent>
            </Tooltip>
          )}

          {visibleItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isCollapsed && "justify-center px-2",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-background")} />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </Link>
            )

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* User Section */}
        <div className={cn("border-t p-3", isCollapsed && "flex justify-center")}>
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold cursor-default">
                  {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex flex-col">
                  <span className="font-medium">{profile.full_name || profile.email}</span>
                  <span className="text-xs text-muted-foreground capitalize">{profile.role}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-sm font-semibold">
                {profile.full_name?.[0] || profile.email[0].toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile.full_name || profile.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60 capitalize">{profile.role}</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}

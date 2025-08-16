"use client"

import { useAuthUser } from "@/lib/auth-hooks"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Menu } from "lucide-react"
import { HireHubLogo } from "./hirehub-logo"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user, logout, role } = useAuthUser()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <HireHubLogo size="sm" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-heading font-bold text-hirehub-gradient truncate">{title}</h1>
              {subtitle && <p className="text-xs md:text-sm text-muted-foreground font-body truncate">{subtitle}</p>}
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-body font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground font-body capitalize">{role}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="font-body bg-transparent hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-body">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{role}</div>
                </div>
                <DropdownMenuItem onClick={logout} className="font-body">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}

"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/lib/auth-hooks"
import DashboardHeader from "./dashboard-header"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  requiredRole?: "student" | "faculty"
}

export default function DashboardLayout({ children, title, subtitle, requiredRole }: DashboardLayoutProps) {
  const { user, isLoading, role } = useAuthUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
      return
    }

    if (!isLoading && user && requiredRole && role !== requiredRole) {
      router.push("/dashboard")
      return
    }
  }, [user, isLoading, router, requiredRole, role])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground font-sans">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requiredRole && role !== requiredRole) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title={title} subtitle={subtitle} />
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}

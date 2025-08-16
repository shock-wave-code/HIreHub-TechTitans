"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/lib/auth-hooks"
import StudentDashboard from "@/components/student-dashboard"
import FacultyDashboard from "@/components/faculty-dashboard"

export default function DashboardPage() {
  const { user, isLoading, role } = useAuthUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isLoading, router])

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

  return (
    <div className="min-h-screen bg-background">{role === "student" ? <StudentDashboard /> : <FacultyDashboard />}</div>
  )
}

"use client"

import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users } from "lucide-react"

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"student" | "faculty" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelection = async (role: "student" | "faculty") => {
    if (!user) return

    setIsLoading(true)
    try {
      await user.update({
        publicMetadata: { role },
      })
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating user role:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600">Please select your role to get started</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === "student" ? "ring-2 ring-emerald-500 bg-emerald-50" : ""
            }`}
            onClick={() => setSelectedRole("student")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle>I'm a Student</CardTitle>
              <CardDescription>Looking for internship opportunities and want to apply to positions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Browse available internships</li>
                <li>• Submit applications with resume</li>
                <li>• Track application status</li>
                <li>• Receive notifications</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedRole === "faculty" ? "ring-2 ring-emerald-500 bg-emerald-50" : ""
            }`}
            onClick={() => setSelectedRole("faculty")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle>I'm Faculty</CardTitle>
              <CardDescription>Want to post internship opportunities and manage applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Post internship opportunities</li>
                <li>• Review student applications</li>
                <li>• Manage application status</li>
                <li>• Download resumes</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {selectedRole && (
          <div className="text-center mt-8">
            <Button
              onClick={() => handleRoleSelection(selectedRole)}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 px-8 py-2"
            >
              {isLoading
                ? "Setting up your account..."
                : `Continue as ${selectedRole === "student" ? "Student" : "Faculty"}`}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

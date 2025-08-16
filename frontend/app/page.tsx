"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthUser } from "@/lib/auth-hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Users, Briefcase, TrendingUp } from "lucide-react"
import Link from "next/link"
import { HireHubLogo } from "@/components/shared/hirehub-logo"

export default function HomePage() {
  const { user, isLoading } = useAuthUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-center mb-8">
              <HireHubLogo size="lg" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-hirehub-gradient mb-6 leading-tight">
              Internship Portal
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-body mb-8 leading-relaxed max-w-2xl mx-auto">
              Connect students with meaningful internship opportunities. A modern platform for students to discover and
              apply for internships, and for faculty to manage applications efficiently.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              asChild
              size="lg"
              className="font-body font-medium transition-all duration-200 hover:scale-[1.02] text-base px-8 py-3"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="font-body font-medium bg-transparent hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] text-base px-8 py-3"
            >
              <Link href="/sign-up">Create Account</Link>
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold mb-2">For Students</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Discover and apply for internships that match your skills and interests
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold mb-2">For Faculty</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Post internships and manage applications with powerful tools
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold mb-2">Easy Applications</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Streamlined application process with resume upload and tracking
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Monitor application status and manage your internship journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Calendar, DollarSign, Building2, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import ApplicationModal from "@/components/application-modal"
import LoadingSpinner from "@/components/shared/loading-spinner"

interface InternshipDetail {
  id: string
  title: string
  description: string
  skillsRequired: string[]
  stipend: string
  applicationDeadline: string
  location: string
  companyName: string
  duration: string
}

export default function InternshipDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [internship, setInternship] = useState<InternshipDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "student") {
      router.push("/dashboard")
      return
    }

    fetchInternshipDetails()
    checkApplicationStatus()
  }, [params.id, user])

  const fetchInternshipDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/internships/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInternship(data)
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error fetching internship details:", error)
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const checkApplicationStatus = () => {
    const storedApplications = localStorage.getItem("userApplications")
    if (storedApplications) {
      const applications = JSON.parse(storedApplications)
      const hasAppliedToThis = applications.some((app: any) => app.internshipId === params.id)
      setHasApplied(hasAppliedToThis)
    }
  }

  const handleApplicationSuccess = () => {
    setHasApplied(true)
    setShowApplicationModal(false)
  }

  if (loading) {
    return <LoadingSpinner message="Loading internship details..." />
  }

  if (!internship) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-sans">Internship not found</p>
          <Button asChild className="mt-4 font-sans">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isDeadlinePassed = new Date(internship.applicationDeadline) < new Date()
  const isDeadlineSoon = new Date(internship.applicationDeadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="font-sans hover:bg-muted/50 transition-colors">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-serif font-bold text-primary truncate">Internship Details</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2 min-w-0 flex-1">
                  <CardTitle className="text-2xl md:text-3xl font-serif leading-tight">{internship.title}</CardTitle>
                  <CardDescription className="font-sans flex items-center gap-2 text-base">
                    <Building2 className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{internship.companyName}</span>
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  {!hasApplied && !isDeadlinePassed && (
                    <Button
                      onClick={() => setShowApplicationModal(true)}
                      className="font-sans transition-all duration-200 hover:scale-[1.02] w-full lg:w-auto"
                      size="lg"
                    >
                      Apply Now
                    </Button>
                  )}
                  {hasApplied && (
                    <Badge variant="default" className="font-sans text-center justify-center py-2 px-4">
                      Application Submitted
                    </Badge>
                  )}
                  {isDeadlinePassed && !hasApplied && (
                    <Badge variant="destructive" className="font-sans text-center justify-center py-2 px-4">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Deadline Passed
                    </Badge>
                  )}
                  {isDeadlineSoon && !isDeadlinePassed && !hasApplied && (
                    <Badge
                      variant="secondary"
                      className="font-sans text-center justify-center py-1 px-3 bg-orange-100 text-orange-800"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Deadline Soon
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm font-sans p-3 bg-muted/30 rounded-lg">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{internship.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-sans p-3 bg-muted/30 rounded-lg">
                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{internship.stipend}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-sans p-3 bg-muted/30 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{internship.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-sans p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span
                    className={`truncate ${isDeadlineSoon && !isDeadlinePassed ? "text-orange-600 font-medium" : isDeadlinePassed ? "text-destructive" : ""}`}
                  >
                    {new Date(internship.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-semibold">About This Role</h3>
                <p className="text-muted-foreground font-sans leading-relaxed whitespace-pre-wrap">
                  {internship.description}
                </p>
              </div>

              <Separator />

              {/* Skills Required */}
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-semibold">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.skillsRequired.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="font-sans hover:bg-primary/10 transition-colors">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationModal
          internshipId={internship.id}
          internshipTitle={internship.title}
          onClose={() => setShowApplicationModal(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  )
}

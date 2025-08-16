"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuthUser } from "@/lib/auth-hooks"
import { useApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Check, X } from "lucide-react"
import DashboardLayout from "@/components/shared/dashboard-layout"
import LoadingSpinner from "@/components/shared/loading-spinner"
import EmptyState from "@/components/shared/empty-state"
import InternshipCard from "@/components/shared/internship-card"

interface Internship {
  id: string
  title: string
  description: string
  skillsRequired: string[]
  stipend: string
  applicationDeadline: string
  location: string
  companyName: string
  duration: string
  facultyId: string
  createdAt: string
}

interface Application {
  applicationId: string
  studentName: string
  email: string
  resumeUrl: string
  status: string
}

export default function FacultyDashboard() {
  const { user } = useAuthUser()
  const apiClient = useApiClient()
  const [internships, setInternships] = useState<Internship[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedInternshipId, setSelectedInternshipId] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showApplicationsModal, setShowApplicationsModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state for creating internship
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    stipend: "",
    applicationDeadline: "",
    location: "",
    companyName: "",
    duration: "",
  })
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    try {
      const response = await apiClient.get<Internship[]>("/internships")
      if (response.success && response.data) {
        // Filter internships posted by this faculty (in real app, this would be done server-side)
        const facultyInternships = response.data.filter((internship: Internship) => internship.facultyId === user?.id)
        setInternships(facultyInternships)
      }
    } catch (error) {
      console.error("Error fetching internships:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (internshipId: string) => {
    try {
      const response = await apiClient.get<Application[]>(`/internships/${internshipId}/applications`)
      if (response.success && response.data) {
        setApplications(response.data)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    }
  }

  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")

    try {
      const skillsArray = formData.skillsRequired
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)

      const response = await apiClient.post("/internships", {
        ...formData,
        skillsRequired: skillsArray,
      })

      if (response.success) {
        setShowCreateModal(false)
        setFormData({
          title: "",
          description: "",
          skillsRequired: "",
          stipend: "",
          applicationDeadline: "",
          location: "",
          companyName: "",
          duration: "",
        })
        fetchInternships() // Refresh the list
      } else {
        setFormError(response.error || "Failed to create internship")
      }
    } catch (error) {
      setFormError("Network error. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: string, status: "Accepted" | "Rejected") => {
    try {
      const response = await apiClient.patch(`/applications/${applicationId}`, { status })

      if (response.success) {
        // Refresh applications
        if (selectedInternshipId) {
          fetchApplications(selectedInternshipId)
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error)
    }
  }

  const handleViewApplications = (internshipId: string) => {
    setSelectedInternshipId(internshipId)
    fetchApplications(internshipId)
    setShowApplicationsModal(true)
  }

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  return (
    <DashboardLayout title="Faculty Dashboard" requiredRole="faculty">
      <Tabs defaultValue="internships" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="internships" className="font-sans">
              My Internships
            </TabsTrigger>
          </TabsList>

          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="font-sans">
                <Plus className="h-4 w-4 mr-2" />
                Post New Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">Post New Internship</DialogTitle>
                <DialogDescription className="font-sans">
                  Fill out the details for your internship posting
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateInternship} className="space-y-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-sans font-medium">
                      Job Title
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Frontend Developer Intern"
                      required
                      className="font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="font-sans font-medium">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g., TechCorp"
                      required
                      className="font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="font-sans font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the internship role, responsibilities, and requirements..."
                    rows={4}
                    required
                    className="font-sans"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skillsRequired" className="font-sans font-medium">
                    Skills Required
                  </Label>
                  <Input
                    id="skillsRequired"
                    value={formData.skillsRequired}
                    onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
                    placeholder="e.g., React, JavaScript, CSS (comma-separated)"
                    required
                    className="font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="font-sans font-medium">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Remote, New York, etc."
                      required
                      className="font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stipend" className="font-sans font-medium">
                      Stipend
                    </Label>
                    <Input
                      id="stipend"
                      value={formData.stipend}
                      onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                      placeholder="e.g., $1000/month, Unpaid"
                      required
                      className="font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="font-sans font-medium">
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 3 months, Summer 2024"
                      required
                      className="font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline" className="font-sans font-medium">
                      Application Deadline
                    </Label>
                    <Input
                      id="applicationDeadline"
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                      required
                      className="font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 font-sans bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading} className="flex-1 font-sans">
                    {formLoading ? "Creating..." : "Post Internship"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="internships" className="space-y-6">
          {internships.length === 0 ? (
            <EmptyState
              title="No Internships Posted"
              description="You haven't posted any internships yet."
              actionLabel="Post Your First Internship"
              onAction={() => setShowCreateModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship.id}
                  internship={internship}
                  variant="faculty"
                  onViewApplications={handleViewApplications}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Applications Modal */}
      <Dialog open={showApplicationsModal} onOpenChange={setShowApplicationsModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">Applications</DialogTitle>
            <DialogDescription className="font-sans">Manage applications for this internship</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-sans">No applications received yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.applicationId}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-serif font-semibold">{application.studentName}</h4>
                          <p className="text-sm text-muted-foreground font-sans">{application.email}</p>
                          <div className="flex items-center gap-4">
                            <Badge
                              variant={
                                application.status === "Accepted"
                                  ? "default"
                                  : application.status === "Rejected"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="font-sans"
                            >
                              {application.status}
                            </Badge>
                            <Button variant="link" size="sm" asChild className="font-sans p-0 h-auto">
                              <a
                                href={`http://localhost:3000${application.resumeUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Resume
                              </a>
                            </Button>
                          </div>
                        </div>

                        {application.status === "Pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(application.applicationId, "Accepted")}
                              className="font-sans"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateApplicationStatus(application.applicationId, "Rejected")}
                              className="font-sans"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

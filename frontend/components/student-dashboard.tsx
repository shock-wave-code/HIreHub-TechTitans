"use client"

import { useState, useEffect } from "react"
import { useAuthUser } from "@/lib/auth-hooks"
import { useApiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import DashboardLayout from "@/components/shared/dashboard-layout"
import LoadingSpinner from "@/components/shared/loading-spinner"
import EmptyState from "@/components/shared/empty-state"
import InternshipCard from "@/components/shared/internship-card"
import SearchFilters from "@/components/shared/search-filters"

interface Internship {
  id: string
  title: string
  companyName: string
  location: string
  stipend: string
  applicationDeadline: string
}

interface Application {
  applicationId: string
  internshipId: string
  status: string
  appliedAt: string
  internship?: Internship
}

export default function StudentDashboard() {
  const { user } = useAuthUser()
  const apiClient = useApiClient()
  const [internships, setInternships] = useState<Internship[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInternships()
    fetchApplications()
  }, [])

  const fetchInternships = async () => {
    try {
      const response = await apiClient.get<Internship[]>("/internships")
      if (response.success && response.data) {
        setInternships(response.data)
      }
    } catch (error) {
      console.error("Error fetching internships:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    // In a real app, you'd fetch user's applications from an endpoint
    // For now, we'll use localStorage to simulate this
    const storedApplications = localStorage.getItem("userApplications")
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications))
    }
  }

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !locationFilter || internship.location.toLowerCase().includes(locationFilter.toLowerCase())
    return matchesSearch && matchesLocation
  })

  const uniqueLocations = [...new Set(internships.map((i) => i.location))]

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  return (
    <DashboardLayout title="Internship Portal" requiredRole="student">
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse" className="font-sans">
            Browse Internships
          </TabsTrigger>
          <TabsTrigger value="applications" className="font-sans">
            My Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            locationFilter={locationFilter}
            onLocationChange={setLocationFilter}
            locations={uniqueLocations}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInternships.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} variant="student" />
            ))}
          </div>

          {filteredInternships.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-sans">No internships found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-serif font-semibold">My Applications</h2>

            {applications.length === 0 ? (
              <EmptyState
                title="No Applications Yet"
                description="You haven't applied to any internships yet."
                actionLabel="Browse Internships"
                onAction={() => document.querySelector('[value="browse"]')?.click()}
              />
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => (
                  <Card key={application.applicationId}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif font-semibold">Application #{application.applicationId}</h3>
                          <p className="text-sm text-muted-foreground font-sans">
                            Applied on {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}

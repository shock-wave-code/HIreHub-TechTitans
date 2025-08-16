"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, DollarSign, Building2, Eye } from "lucide-react"
import Link from "next/link"

interface InternshipCardProps {
  internship: {
    id: string
    title: string
    companyName: string
    location: string
    stipend: string
    applicationDeadline: string
  }
  variant?: "student" | "faculty"
  onViewApplications?: (id: string) => void
}

export default function InternshipCard({ internship, variant = "student", onViewApplications }: InternshipCardProps) {
  const isDeadlineSoon = new Date(internship.applicationDeadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const isDeadlinePassed = new Date(internship.applicationDeadline) < new Date()

  return (
    <Card className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 group">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {internship.title}
        </CardTitle>
        <CardDescription className="font-sans flex items-center gap-1">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{internship.companyName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{internship.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-sans">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{internship.stipend}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-sans">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span
              className={`truncate ${isDeadlineSoon && !isDeadlinePassed ? "text-orange-600 font-medium" : isDeadlinePassed ? "text-destructive" : "text-muted-foreground"}`}
            >
              Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="pt-2">
          {variant === "student" ? (
            <Button
              asChild
              className="w-full font-sans transition-all duration-200 hover:scale-[1.02]"
              disabled={isDeadlinePassed}
            >
              <Link href={`/internships/${internship.id}`}>
                {isDeadlinePassed ? "Deadline Passed" : "View Details"}
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => onViewApplications?.(internship.id)}
              className="w-full font-sans bg-transparent hover:bg-primary/5 transition-all duration-200 hover:scale-[1.02]"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Applications
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

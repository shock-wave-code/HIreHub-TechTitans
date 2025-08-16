"use client"

import type React from "react"

import { useState } from "react"
import { useAuthUser } from "@/lib/auth-hooks"
import { useApiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileText, Upload, CheckCircle } from "lucide-react"

interface ApplicationModalProps {
  internshipId: string
  internshipTitle: string
  onClose: () => void
  onSuccess: () => void
}

export default function ApplicationModal({ internshipId, internshipTitle, onClose, onSuccess }: ApplicationModalProps) {
  const { user } = useAuthUser()
  const apiClient = useApiClient()
  const [resume, setResume] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setResume(file)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resume) {
      setError("Please upload your resume")
      return
    }

    setLoading(true)
    setError("")
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("internshipId", internshipId)
      formData.append("resume", resume)

      const response = await apiClient.postFormData("/applications", formData)

      if (response.success) {
        setUploadProgress(100)

        // Store application in localStorage for demo purposes
        const storedApplications = localStorage.getItem("userApplications")
        const applications = storedApplications ? JSON.parse(storedApplications) : []

        const newApplication = {
          applicationId: response.data?.applicationId || Date.now().toString(),
          internshipId: internshipId,
          status: "Pending",
          appliedAt: new Date().toISOString(),
        }

        applications.push(newApplication)
        localStorage.setItem("userApplications", JSON.stringify(applications))

        // Small delay to show success state
        setTimeout(() => {
          onSuccess()
        }, 1000)
      } else {
        setError(response.error || "Application failed")
        setUploadProgress(0)
      }
    } catch (error) {
      setError("Network error. Please try again.")
      setUploadProgress(0)
    } finally {
      clearInterval(progressInterval)
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Apply for Internship</DialogTitle>
          <DialogDescription className="font-sans line-clamp-2">{internshipTitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="resume" className="font-sans font-medium">
              Resume (PDF only, max 5MB)
            </Label>
            <div className="relative">
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="font-sans file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:transition-colors"
                required
                disabled={loading}
              />
              {resume && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium truncate">{resume.name}</p>
                    <p className="text-xs text-muted-foreground font-sans">
                      {(resume.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploadProgress === 100 && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
              )}
            </div>
          </div>

          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-sans">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 font-sans bg-transparent hover:bg-muted/50 transition-colors"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !resume}
              className="flex-1 font-sans transition-all duration-200 hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Submit Application
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

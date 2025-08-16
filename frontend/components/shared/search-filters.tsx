"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  locationFilter: string
  onLocationChange: (value: string) => void
  locations: string[]
}

export default function SearchFilters({
  searchTerm,
  onSearchChange,
  locationFilter,
  onLocationChange,
  locations,
}: SearchFiltersProps) {
  const hasFilters = searchTerm || locationFilter

  const clearFilters = () => {
    onSearchChange("")
    onLocationChange("")
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title or company..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <Select value={locationFilter} onValueChange={onLocationChange}>
            <SelectTrigger className="w-full sm:w-48 font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="" className="font-sans">
                All locations
              </SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location} className="font-sans">
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors bg-transparent"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {hasFilters && (
        <div className="text-sm text-muted-foreground font-sans">
          {searchTerm && <span>Searching for "{searchTerm}"</span>}
          {searchTerm && locationFilter && <span> • </span>}
          {locationFilter && <span>in {locationFilter}</span>}
        </div>
      )}
    </div>
  )
}

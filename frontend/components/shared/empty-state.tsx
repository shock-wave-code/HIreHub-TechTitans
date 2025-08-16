"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <h3 className="text-lg font-serif font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground font-sans mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="font-sans">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

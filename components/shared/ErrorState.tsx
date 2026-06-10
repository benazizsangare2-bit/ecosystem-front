"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[40vh] p-8">
      <Alert variant="destructive" className="max-w-md rounded-2xl">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3 rounded-full">
            <RefreshCw className="mr-2 h-3 w-3" /> Try again
          </Button>
        )}
      </Alert>
    </div>
  )
}

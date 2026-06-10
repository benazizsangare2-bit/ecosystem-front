"use client"

import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import type { ReportStatus } from "@/lib/types"
import { STATUS_LABELS } from "@/lib/types"

const STATUSES: ReportStatus[] = ["pending", "under_review", "investigating", "resolved", "rejected", "duplicate"]

interface StatusUpdateFormProps {
  reportId: number
  currentStatus: ReportStatus
  onSuccess: () => void
}

export function StatusUpdateForm({ reportId, currentStatus, onSuccess }: StatusUpdateFormProps) {
  const [status, setStatus] = useState<ReportStatus>(currentStatus)
  const [adminNotes, setAdminNotes] = useState("")
  const [duplicateOf, setDuplicateOf] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.admin.updateStatus(reportId, {
        status,
        admin_notes: adminNotes || undefined,
        duplicate_of: status === "duplicate" && duplicateOf ? Number(duplicateOf) : null,
      })
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    }
    setLoading(false)
  }

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Update Status</CardTitle>
        <CardDescription>Change report status and add notes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ReportStatus)}>
              <SelectTrigger id="status" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s} disabled={s === currentStatus}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="rounded-xl resize-none"
              placeholder="Add internal notes about this report..."
            />
          </div>

          {status === "duplicate" && (
            <div className="space-y-2">
              <Label htmlFor="duplicateOf">Original Report ID</Label>
              <Input
                id="duplicateOf"
                type="number"
                value={duplicateOf}
                onChange={(e) => setDuplicateOf(e.target.value)}
                className="rounded-xl"
                placeholder="Enter the original report ID"
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="rounded-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

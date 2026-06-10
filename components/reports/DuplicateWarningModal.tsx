"use client"

import { AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ReportSummary } from "@/lib/types"

interface DuplicateWarningModalProps {
  open: boolean
  duplicates: ReportSummary[]
  onSubmitAnyway: () => void
  onCancel: () => void
}

export function DuplicateWarningModal({ open, duplicates, onSubmitAnyway, onCancel }: DuplicateWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Possible Duplicate Report
          </DialogTitle>
          <DialogDescription>
            Our system found {duplicates.length} similar report{duplicates.length > 1 ? "s" : ""} in your area. Please review before submitting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {duplicates.map((d) => (
            <div key={d.report_id} className="rounded-xl border border-border/50 bg-muted/30 p-3 text-sm">
              <p className="font-medium truncate">{d.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {d.latitude.toFixed(3)}, {d.longitude.toFixed(3)} &middot;{" "}
                {new Date(d.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} className="rounded-full">Cancel</Button>
          <Button onClick={onSubmitAnyway} className="rounded-full bg-amber-600 hover:bg-amber-700">
            Submit Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

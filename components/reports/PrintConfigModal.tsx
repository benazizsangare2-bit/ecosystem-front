"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Printer, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { PrintConfig } from "@/lib/types"

interface Props {
  reportId: number
  isAdmin: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrintConfigModal({ reportId, isAdmin, open, onOpenChange }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<PrintConfig>({
    recipient: "",
    purpose: "",
    additional_notes: "",
    include_images: true,
    include_statistics: true,
    include_timeline: true,
    include_admin_notes: true,
    include_rejection_reason: true,
    include_duplicate_info: true,
    include_reporter_info: isAdmin,
  })

  const handlePrint = () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("recipient", config.recipient)
    params.set("purpose", config.purpose)
    params.set("notes", config.additional_notes)
    params.set("images", String(config.include_images))
    params.set("stats", String(config.include_statistics))
    params.set("timeline", String(config.include_timeline))
    params.set("adminNotes", String(config.include_admin_notes))
    params.set("rejection", String(config.include_rejection_reason))
    params.set("duplicate", String(config.include_duplicate_info))
    params.set("reporter", String(config.include_reporter_info))
    onOpenChange(false)
    router.push(`/print/${reportId}?${params.toString()}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print Report
          </DialogTitle>
          <DialogDescription>
            Configure how your report will look when printed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Document Details</h4>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient (optional)</Label>
              <Input
                id="recipient"
                placeholder="e.g. Environmental Protection Agency"
                value={config.recipient}
                onChange={(e) => setConfig((c) => ({ ...c, recipient: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose (optional)</Label>
              <Input
                id="purpose"
                placeholder="e.g. Official Environmental Report"
                value={config.purpose}
                onChange={(e) => setConfig((c) => ({ ...c, purpose: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={config.additional_notes}
                onChange={(e) => setConfig((c) => ({ ...c, additional_notes: e.target.value }))}
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Include Sections</h4>
            <div className="grid grid-cols-2 gap-3">
              <Label className="flex items-center justify-between rounded-lg border border-border/50 p-3 cursor-pointer hover:bg-muted/30">
                <span className="text-sm">Images</span>
                <Switch checked={config.include_images} onCheckedChange={(v) => setConfig((c) => ({ ...c, include_images: v }))} />
              </Label>
              <Label className="flex items-center justify-between rounded-lg border border-border/50 p-3 cursor-pointer hover:bg-muted/30">
                <span className="text-sm">Statistics</span>
                <Switch checked={config.include_statistics} onCheckedChange={(v) => setConfig((c) => ({ ...c, include_statistics: v }))} />
              </Label>
              <Label className="flex items-center justify-between rounded-lg border border-border/50 p-3 cursor-pointer hover:bg-muted/30">
                <span className="text-sm">Timeline</span>
                <Switch checked={config.include_timeline} onCheckedChange={(v) => setConfig((c) => ({ ...c, include_timeline: v }))} />
              </Label>
              <Label className="flex items-center justify-between rounded-lg border border-border/50 p-3 cursor-pointer hover:bg-muted/30">
                <span className="text-sm">Admin Notes</span>
                <Switch checked={config.include_admin_notes} onCheckedChange={(v) => setConfig((c) => ({ ...c, include_admin_notes: v }))} />
              </Label>
              <Label className="flex items-center justify-between rounded-lg border border-border/50 p-3 cursor-pointer hover:bg-muted/30">
                <span className="text-sm">Rejection Reason</span>
                <Switch checked={config.include_rejection_reason} onCheckedChange={(v) => setConfig((c) => ({ ...c, include_rejection_reason: v }))} />
              </Label>
              <Label className="flex items-center justify-between rounded-lg border border-border/50 p-3 cursor-pointer hover:bg-muted/30">
                <span className="text-sm">Duplicate Info</span>
                <Switch checked={config.include_duplicate_info} onCheckedChange={(v) => setConfig((c) => ({ ...c, include_duplicate_info: v }))} />
              </Label>
              {isAdmin && (
                <Label className="flex items-center justify-between rounded-lg border border-border/50 p-3 cursor-pointer hover:bg-muted/30">
                  <span className="text-sm">Reporter Info</span>
                  <Switch checked={config.include_reporter_info} onCheckedChange={(v) => setConfig((c) => ({ ...c, include_reporter_info: v }))} />
                </Label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Cancel
          </Button>
          <Button onClick={handlePrint} disabled={loading} className="rounded-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
            {loading ? "Preparing..." : "Print Preview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

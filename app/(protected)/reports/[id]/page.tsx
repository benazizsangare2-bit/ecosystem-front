"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, ThumbsUp, Eye, Edit3, Trash2, Share2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/reports/StatusBadge"
import { CommentSection } from "@/components/reports/CommentSection"
import { Map } from "@/components/shared/Map"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button as DialogButton } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Report } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"
import { toast } from "sonner"

export default function MyReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchReport = () => {
    setLoading(true)
    api.reports.getMyReport(Number(id))
      .then(setReport)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReport() }, [id])

  const handleLike = async () => {
    if (!report || report.status !== "investigating") return
    try {
      const result = await api.reports.toggleLike(report.report_id)
      setReport((prev) => prev ? { ...prev, upvote_count: result.upvote_count } : prev)
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.reports.delete(Number(id))
      toast.success("Report deleted")
      router.push("/dashboard")
    } catch {
      toast.error("Failed to delete report")
    }
    setDeleting(false)
    setDeleteOpen(false)
  }

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({ title: report?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={fetchReport} />
  if (!report) return <ErrorState message="Report not found" />

  const isPending = report.status === "pending"
  const canInteract = report.status === "investigating"
  const photoUrl = report.photo_urls?.[0] ? `/uploads/${report.photo_urls[0]}` : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 rounded-full">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-border/50">
              <img src={photoUrl} alt={report.title} className="w-full h-80 object-cover" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={report.status} />
              <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[report.category]}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-heading">{report.title}</h1>
            {report.duplicate_of && (
              <p className="text-sm text-orange-600 mt-2">
                Duplicate of:{" "}
                <Link
                  href={`/reports/${report.duplicate_of}`}
                  className="underline underline-offset-2 hover:text-orange-800"
                >
                  {report.duplicate_of_title || `Report #${report.duplicate_of}`}
                </Link>
                {report.duplicate_of_address && <> at {report.duplicate_of_address}</>}
              </p>
            )}
            {report.admin_notes && (
              <div className="mt-4 rounded-xl bg-muted/30 p-4 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Admin Notes</p>
                <p className="text-sm">{report.admin_notes}</p>
              </div>
            )}
            <p className="mt-4 text-muted-foreground leading-relaxed">{report.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(report.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" /> {report.upvote_count}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {report.view_count}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {canInteract && (
              <Button variant="outline" size="sm" onClick={handleLike} className="rounded-full">
                <ThumbsUp className="mr-1.5 h-4 w-4" /> {report.upvote_count}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={shareReport} className="rounded-full">
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            {isPending && (
              <>
                <Button variant="outline" size="sm" asChild className="rounded-full">
                  <Link href={`/reports/${report.report_id}/edit`}><Edit3 className="mr-1.5 h-4 w-4" /> Edit</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </>
            )}
          </div>

          <Separator />
          <CommentSection reportId={report.report_id} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl overflow-hidden border border-border/50 h-64">
            <Map
              points={[{ lat: report.latitude, lng: report.longitude, title: report.title }]}
              className="h-full w-full"
            />
          </div>
          {report.address && <p className="mt-2 text-xs text-muted-foreground">{report.address}</p>}
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Report?</DialogTitle>
            <DialogDescription>This action cannot be undone. This report will be permanently removed.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogButton variant="outline" onClick={() => setDeleteOpen(false)} className="rounded-full" disabled={deleting}>Cancel</DialogButton>
            <DialogButton onClick={handleDelete} className="rounded-full bg-destructive hover:bg-destructive/90" disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </DialogButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Calendar, ThumbsUp, Eye, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/reports/StatusBadge"
import { CommentSection } from "@/components/reports/CommentSection"
import { Map } from "@/components/shared/Map"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import type { Report } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"

export default function PublicReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchReport = () => {
    setLoading(true)
    setError("")
    api.reports.getPublicDetail(Number(id))
      .then(setReport)
      .catch(() =>
        api.reports.getMyReport(Number(id)).then(setReport).catch((err: Error) => {
          setError(err.message)
        })
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReport() }, [id])

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({ title: report?.title, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorState message={error} onRetry={fetchReport} />
  if (!report) return <ErrorState message="Report not found" />

  const photoUrl = report.photo_urls?.[0] ? `/uploads/${report.photo_urls[0]}` : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6 rounded-full">
        <Link href="/reports/public"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports</Link>
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
            <p className="mt-4 text-muted-foreground leading-relaxed">{report.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(report.created_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" /> {report.upvote_count}</span>
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {report.view_count}</span>
          </div>

          <Button variant="outline" size="sm" onClick={shareReport} className="rounded-full">
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>

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
          {report.address && (
            <p className="mt-2 text-xs text-muted-foreground">{report.address}</p>
          )}
        </div>
      </div>
    </div>
  )
}

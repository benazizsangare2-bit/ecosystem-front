"use client"

import Link from "next/link"
import { MapPin, Calendar, Eye, ThumbsUp, MessageSquare } from "lucide-react"
import type { Report } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"
import { StatusBadge } from "./StatusBadge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ReportCard({
  report,
  href,
  compact,
}: {
  report: Report
  href?: string
  compact?: boolean
}) {
  const thumbnail = report.thumbnail_urls?.[0]
    ? `/uploads/${report.thumbnail_urls[0]}`
    : report.photo_urls?.[0]
      ? `/uploads/${report.photo_urls[0]}`
      : null

  const content = (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        compact && "flex flex-row items-center gap-4 p-4"
      )}
    >
      {!compact && thumbnail && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={thumbnail}
            alt={report.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        </div>
      )}
      <CardContent className={cn("p-5", compact && "p-0 flex-1")}>
        {compact && thumbnail && (
          <div className="h-16 w-16 shrink-0 rounded-xl overflow-hidden">
            <img src={thumbnail} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className={cn("flex items-start justify-between gap-2", compact && "flex-col")}>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-semibold leading-tight truncate", compact ? "text-sm" : "text-base")}>
              {report.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {CATEGORY_LABELS[report.category] || report.category}
            </p>
          </div>
          <StatusBadge status={report.status} className="shrink-0" />
        </div>

        {!compact && report.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{report.description}</p>
        )}

        <div className={cn("flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground", compact && "mt-2")}>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.latitude.toFixed(3)}, {report.longitude.toFixed(3)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(report.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 border-t border-border/30 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" /> {report.upvote_count}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" /> {report.view_count}
        </span>
      </CardFooter>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

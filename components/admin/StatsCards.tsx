"use client"

import { FileText, Activity, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AdminStats } from "@/lib/types"

export function StatsCards({ stats }: { stats: AdminStats }) {
  const cards = [
    { label: "Total Reports", value: stats.total_reports, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
    { label: "Investigating", value: stats.by_status?.investigating || 0, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Last 7 Days", value: stats.recent_reports_7d, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "Duplicate Warnings", value: stats.duplicate_warnings, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100" },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="rounded-2xl border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`rounded-full ${c.bg} p-3`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

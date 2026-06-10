"use client"

import { useEffect, useState, useCallback } from "react"
import { BarChart3, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCards } from "@/components/admin/StatsCards"
import { ErrorState } from "@/components/shared/ErrorState"
import { api } from "@/lib/api"
import type { AdminStats } from "@/lib/types"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.admin.getStats()
      setStats(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load stats")
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of platform activity</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : stats ? (
        <div className="space-y-8">
          <StatsCards stats={stats} />

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Reports by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.by_status || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-28 capitalize">
                        {STATUS_LABELS[key as keyof typeof STATUS_LABELS] || key.replace("_", " ")}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(value / stats.total_reports) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Reports by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.by_category || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-36 truncate">
                        {CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] || key.replace("_", " ")}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${(value / stats.total_reports) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}

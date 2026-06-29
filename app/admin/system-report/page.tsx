"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, CalendarDays, BarChart3, Trophy, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { api } from "@/lib/api"
import type { SystemReportResponse } from "@/lib/types"
import { ErrorState } from "@/components/shared/ErrorState"

const formatShortDate = (value: string) => {
  try {
    return format(new Date(value), "MMM d, yyyy")
  } catch {
    return value
  }
}

export default function AdminSystemReportPage() {
  const [report, setReport] = useState<SystemReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params: { from?: string; to?: string } = {}
      if (from) params.from = from
      if (to) params.to = to
      const result = await api.admin.getSystemReport(params)
      setReport(result)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load report")
    }
    setLoading(false)
  }, [from, to])

  useEffect(() => {
    const today = new Date()
    const prevMonth = new Date(today)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setFrom(format(prevMonth, "yyyy-MM-dd"))
    setTo(format(today, "yyyy-MM-dd"))
  }, [])

  useEffect(() => {
    if (from && to) {
      fetchReport()
    }
  }, [from, to, fetchReport])

  const handleDownloadPdf = async () => {
    if (!from || !to) return
    try {
      const blob = await api.admin.downloadSystemReportPdf({ from, to })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `system-report-${from}-${to}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to download PDF")
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading">System Report</h1>
        <p className="text-muted-foreground mt-1">Generate and export a platform-wide operational report.</p>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg">Report range</CardTitle>
            <p className="text-sm text-muted-foreground">Pull statistics for the selected timeframe.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="grid gap-2 text-sm">
              <span>From</span>
              <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm">
              <span>To</span>
              <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
            </label>
            <Button variant="secondary" className="min-h-[42px] mt-1 sm:mt-0" onClick={handleDownloadPdf} disabled={!report || !from || !to}>
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-border/50 bg-background/80 p-8 text-center text-muted-foreground">Loading system report…</div>
      ) : error ? (
        <div className="mt-8"><ErrorState message={error} onRetry={fetchReport} /></div>
      ) : report ? (
        <div className="space-y-8 mt-8">
          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-3 text-primary"><Sparkles className="h-4 w-4" /><p className="text-xs uppercase tracking-[0.2em]">Reports</p></div>
                <p className="mt-4 text-3xl font-semibold">{report.statistics.total_reports}</p>
                <p className="text-sm text-muted-foreground">Total reports in range</p>
              </div>
              <div className="rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-3 text-emerald-500"><Trophy className="h-4 w-4" /><p className="text-xs uppercase tracking-[0.2em]">Users</p></div>
                <p className="mt-4 text-3xl font-semibold">{report.statistics.total_users}</p>
                <p className="text-sm text-muted-foreground">Active users</p>
              </div>
              <div className="rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-3 text-cyan-500"><BarChart3 className="h-4 w-4" /><p className="text-xs uppercase tracking-[0.2em]">Upvotes</p></div>
                <p className="mt-4 text-3xl font-semibold">{report.statistics.total_upvotes}</p>
                <p className="text-sm text-muted-foreground">Total upvotes earned</p>
              </div>
              <div className="rounded-2xl border border-border/50 p-5">
                <div className="flex items-center gap-3 text-orange-500"><CalendarDays className="h-4 w-4" /><p className="text-xs uppercase tracking-[0.2em]">Range</p></div>
                <p className="mt-4 text-3xl font-semibold">{formatShortDate(report.report.date_range.from)} – {formatShortDate(report.report.date_range.to)}</p>
                <p className="text-sm text-muted-foreground">Generated {formatShortDate(report.report.generated_at)}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="rounded-2xl border-border/50 xl:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.charts.weekly_trends.map((point) => (
                  <div key={point.week} className="grid grid-cols-1 gap-2 rounded-2xl border border-border/50 p-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Week starting</div>
                      <p className="font-semibold">{formatShortDate(point.week)}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <p>Total reports: <span className="font-medium text-foreground">{point.total_reports}</span></p>
                      <p>Resolved: <span className="font-medium text-foreground">{point.resolved}</span></p>
                      <p>Investigating: <span className="font-medium text-foreground">{point.investigating}</span></p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="rounded-2xl border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">Resolution rate</p>
                  <p className="mt-2 text-2xl font-semibold">{report.performance.resolution_rate.toFixed(1)}%</p>
                </div>
                <div className="rounded-2xl border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">Duplicate rate</p>
                  <p className="mt-2 text-2xl font-semibold">{report.performance.duplicate_rate.toFixed(1)}%</p>
                </div>
                <div className="rounded-2xl border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">Avg resolution time</p>
                  <p className="mt-2 text-2xl font-semibold">{report.performance.avg_resolution_time.toFixed(1)}h</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="rounded-2xl border-border/50 xl:col-span-2">
              <CardHeader>
                <CardTitle>Top Reporters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.top_reporters.map((reporter) => (
                  <div key={reporter.user_id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 p-4">
                    <div>
                      <p className="font-medium">{reporter.name}</p>
                      <p className="text-sm text-muted-foreground">Report count</p>
                    </div>
                    <p className="text-xl font-semibold">{reporter.report_count}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle>Category distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.charts.category_distribution.map((item) => (
                  <div key={item.category} className="flex items-center justify-between gap-3 rounded-2xl border border-border/50 p-4">
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <p className="font-semibold">{item.count}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border/50">
            <CardHeader>
              <CardTitle>Status distribution</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {report.charts.status_distribution.map((item) => (
                <div key={item.status} className="rounded-2xl border border-border/50 p-4">
                  <p className="text-sm text-muted-foreground">{item.status}</p>
                  <p className="mt-2 text-xl font-semibold">{item.count}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, FileText, Activity, Award, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportCard } from "@/components/reports/ReportCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import type { Report, ReportStatus } from "@/lib/types"

export default function DashboardPage() {
  const { user, refreshProfile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all")

  useEffect(() => { refreshProfile() }, [refreshProfile])

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.reports.getMyReports()
      setReports(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  const filtered = statusFilter === "all" ? reports : reports.filter((r) => r.status === statusFilter)

  const badgeLabel = (score: number) => {
    if (score >= 501) return { label: "Hero trust value", color: "text-amber-600" }
    if (score >= 201) return { label: "Guardian trust value", color: "text-emerald-600" }
    if (score >= 51) return { label: "Contributor trust value", color: "text-blue-600" }
    return { label: "Newcomer trust value", color: "text-gray-600" }
  }

  const badge = badgeLabel(user?.reputation_score || 0)

  const statusCounts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    under_review: reports.filter((r) => r.status === "under_review").length,
    investigating: reports.filter((r) => r.status === "investigating").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
    duplicate: reports.filter((r) => r.status === "duplicate").length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.first_name || "User"}
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/reports/create"><Plus className="mr-2 h-4 w-4" /> New Report</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3"><FileText className="h-5 w-5 text-primary" /></div>
            <div><p className="text-2xl font-bold">{reports.length}</p><p className="text-xs text-muted-foreground">Total Reports</p></div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-emerald-100 p-3"><Activity className="h-5 w-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold">{statusCounts.investigating}</p><p className="text-xs text-muted-foreground">Reports in Investigating</p></div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-amber-100 p-3"><TrendingUp className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-xl font-bold">{user?.reputation_score || 0}</p>
              <p className={`text-xs font-medium ${badge.color}`}>{badge.label}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-violet-100 p-3"><Award className="h-5 w-5 text-violet-600" /></div>
            <div><p className="text-2xl font-bold">{statusCounts.resolved}</p><p className="text-xs text-muted-foreground">Resolved reports</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/50 mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading">My Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ReportStatus | "all")} className="mb-4">
            <TabsList className="rounded-full flex-wrap h-auto">
              {(["all", "pending", "under_review", "investigating", "resolved", "rejected", "duplicate"] as const).map((s) => (
                <TabsTrigger key={s} value={s} className="rounded-full text-xs">
                  {s === "all" ? "All" : s.replace("_", " ")} {statusCounts[s] > 0 && `(${statusCounts[s]})`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchReports} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No reports found</p>
              <Button asChild variant="outline" size="sm" className="mt-4 rounded-full">
                <Link href="/reports/create">Create your first report</Link>
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
                <ReportCard key={r.report_id} report={r} href={`/reports/${r.report_id}`} compact />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, ArrowUpDown, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/reports/StatusBadge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { api } from "@/lib/api"
import type { Report, ReportStatus, ReportCategory } from "@/lib/types"
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/types"

const STATUSES: (ReportStatus | "all")[] = ["all", "pending", "under_review", "investigating", "resolved", "rejected", "duplicate"]
const CATEGORIES: (ReportCategory | "all")[] = ["all", "illegal_dumping", "overflowing_waste", "air_pollution", "water_contamination", "noise_pollution", "deforestation", "bad_roads", "other"]

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [status, setStatus] = useState<ReportStatus | "all">("all")
  const [category, setCategory] = useState<ReportCategory | "all">("all")
  const [search, setSearch] = useState("")
  const [duplicateWarningOnly, setDuplicateWarningOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.admin.listReports({
        status: status !== "all" ? status : undefined,
        category: category !== "all" ? category : undefined,
        page,
        limit,
      })
      setReports(Array.isArray(data.reports) ? data.reports : [])
      setTotal(data.total || 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    }
    setLoading(false)
  }, [status, category, page])

  useEffect(() => { fetchReports() }, [fetchReports])

  const filtered = (search || duplicateWarningOnly ? reports.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !(r.description || "").toLowerCase().includes(search.toLowerCase())) return false
    if (duplicateWarningOnly && !r.duplicate_warning) return false
    return true
  }) : reports)

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading">All Reports</h1>
        <p className="text-muted-foreground mt-1">Manage and review all submitted reports</p>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v as ReportStatus | "all"); setPage(1) }}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : STATUS_LABELS[s as ReportStatus]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => { setCategory(v as ReportCategory | "all"); setPage(1) }}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : CATEGORY_LABELS[c as ReportCategory]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 shrink-0">
              <Switch
                id="dup-warning"
                checked={duplicateWarningOnly}
                onCheckedChange={(v) => setDuplicateWarningOnly(v)}
              />
              <Label htmlFor="dup-warning" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                Duplicate warnings
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="p-6"><ErrorState message={error} onRetry={fetchReports} /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right">Upvotes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reports found</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((r) => (
                        <TableRow key={r.report_id} className="cursor-pointer hover:bg-muted/30" onClick={() => window.location.href = `/admin/reports/${r.report_id}`}>
                          <TableCell className="font-mono text-xs">#{r.report_id}</TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{CATEGORY_LABELS[r.category]}</TableCell>
                          <TableCell><StatusBadge status={r.status} /></TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right text-sm">{r.upvote_count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="p-4 border-t border-border/30">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      <PaginationItem className="text-sm text-muted-foreground">Page {page} of {totalPages}</PaginationItem>
                      <PaginationItem>
                        <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

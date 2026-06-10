"use client"

import { useState, useEffect, useCallback } from "react"
import { MapIcon, ListIcon, Search, SlidersHorizontal, UserPlus, LogIn } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportCard } from "@/components/reports/ReportCard"
import { Map } from "@/components/shared/Map"
import type { MapPoint } from "@/components/shared/Map"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import type { Report } from "@/lib/types"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function PublicReportsPage() {
  const { isAuthenticated } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [view, setView] = useState<"list" | "map">("list")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const limit = 12
  const PUBLIC_SHOW_LIMIT = 2

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.reports.getPublic(page, limit)
      setReports(Array.isArray(data.reports) ? data.reports : [])
      setTotal(data.total || 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports")
    }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchReports() }, [fetchReports])

  const visibleReports = isAuthenticated ? reports : reports.slice(0, PUBLIC_SHOW_LIMIT)

  const mapPoints: MapPoint[] = visibleReports.map((r) => ({
    lat: r.latitude,
    lng: r.longitude,
    title: r.title,
    id: r.report_id,
  }))

  const baseFiltered = search
    ? reports.filter((r) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase())
      )
    : reports

  const filtered = isAuthenticated ? baseFiltered : baseFiltered.slice(0, PUBLIC_SHOW_LIMIT)

  const totalPages = Math.ceil(total / limit)

  function renderRegisterCta() {
    return (
      <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <UserPlus className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold font-heading mb-2">See All Reports</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Create an account or sign in to view all environmental reports in your community and help make a difference.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/register">
            <Button className="rounded-xl">
              <UserPlus className="h-4 w-4 mr-1" />
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="rounded-xl">
              <LogIn className="h-4 w-4 mr-1" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">Public Reports</h1>
        <p className="text-muted-foreground mt-1">
          Browse environmental issues being investigated in your community
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as "list" | "map")} className="ml-auto">
          <TabsList className="rounded-full">
            <TabsTrigger value="list" className="rounded-full">
              <ListIcon className="h-4 w-4 mr-1" /> List
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-full">
              <MapIcon className="h-4 w-4 mr-1" /> Map
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReports} />
      ) : view === "map" ? (
        <>
          <div className="rounded-2xl overflow-hidden border border-border/50 h-[60vh]">
            <Map points={mapPoints} className="h-full w-full" />
          </div>
          {!isAuthenticated && total > PUBLIC_SHOW_LIMIT && renderRegisterCta()}
        </>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No reports found</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((report) => (
              <ReportCard
                key={report.report_id}
                report={report}
                href={`/reports/${report.report_id}/public`}
              />
            ))}
          </div>

          {!isAuthenticated && total > PUBLIC_SHOW_LIMIT && renderRegisterCta()}

          {isAuthenticated && totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}

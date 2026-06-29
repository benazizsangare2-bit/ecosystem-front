"use client"

import { useState, useEffect, useCallback } from "react"
import { ScrollText, Inbox, Search, Filter } from "lucide-react"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { api } from "@/lib/api"
import type { AuditLog } from "@/lib/types"

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [actions, setActions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [actionFilter, setActionFilter] = useState("all")
  const [search, setSearch] = useState("")
  const limit = 15

  const fetchActions = useCallback(async () => {
    try {
      const data = await api.admin.getAuditLogActions()
      if (Array.isArray(data)) setActions(data)
    } catch { /* ignore */ }
  }, [])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.admin.getAuditLogs({
        page,
        limit,
        action: actionFilter !== "all" ? actionFilter : undefined,
      })
      setLogs(Array.isArray(data.logs) ? data.logs : [])
      setTotal(data.pagination?.total || 0)
      setPages(data.pagination?.pages || 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs")
    }
    setLoading(false)
  }, [page, actionFilter])

  useEffect(() => { fetchActions() }, [])
  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filtered = search
    ? logs.filter((l) =>
        l.admin_name.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.target_type.toLowerCase().includes(search.toLowerCase())
      )
    : logs

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading">Audit Log</h1>
        <p className="text-muted-foreground mt-1">Track all admin actions on the platform</p>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admin, action, target..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v ?? "all"); setPage(1) }}>
              <SelectTrigger className="w-[200px] rounded-xl">
                <SelectValue placeholder="Action type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="p-6"><ErrorState message={error} onRetry={fetchLogs} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No audit logs found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {search || actionFilter !== "all" ? "Try adjusting your filters" : "No admin actions have been recorded yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filtered.map((log) => (
                  <div key={log.log_id} className="rounded-xl border border-border/30 p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm capitalize">{log.action.replace(/_/g, " ")}</span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                            {log.admin_name}
                          </span>
                          {log.target_type === "report" && (
                            <span className="text-xs text-muted-foreground font-mono">
                              Report #{log.target_id}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground space-y-1">
                          {log.old_data && log.new_data && (
                            <div className="flex gap-4 flex-wrap">
                              <span><span className="font-medium">Before:</span> {log.old_data}</span>
                              <span><span className="font-medium">After:</span> {log.new_data}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                        {log.ip_address && (
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">{log.ip_address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {pages > 1 && (
                <div className="mt-6 pt-4 border-t border-border/30">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                      </PaginationItem>
                      <PaginationItem className="text-sm text-muted-foreground">Page {page} of {pages} ({total} total)</PaginationItem>
                      <PaginationItem>
                        <PaginationNext onClick={() => setPage((p) => Math.min(pages, p + 1))} className={page >= pages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
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

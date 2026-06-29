"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Trash2, ShieldAlert } from "lucide-react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { User, UserStatus } from "@/lib/types"

const STATUSES: (UserStatus | "all")[] = ["all", "active", "suspended", "banned", "deleted"]

const STATUS_BADGES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-300",
  suspended: "bg-amber-100 text-amber-800 border-amber-300",
  banned: "bg-red-100 text-red-800 border-red-300",
  deleted: "bg-gray-100 text-gray-500 border-gray-300",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [status, setStatus] = useState<UserStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await api.admin.listUsers({
        status: status !== "all" ? status : undefined,
        page,
        limit,
      })
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    }
    setLoading(false)
  }, [status, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const filtered = search ? users.filter((u) => {
    const q = search.toLowerCase()
    return u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  }) : users

  const totalPages = Math.ceil(total / limit)

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    setDeleteError("")
    setDeleteLoading(true)
    try {
      await api.admin.deleteUser(deleteTarget.user_id)
      setDeleteTarget(null)
      fetchUsers()
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete user")
    }
    setDeleteLoading(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading">User Management</h1>
        <p className="text-muted-foreground mt-1">Manage all user accounts</p>
      </div>

      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={status} onValueChange={(v) => { setStatus(v as UserStatus | "all"); setPage(1) }}>
              <SelectTrigger className="w-[160px] rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="p-6"><ErrorState message={error} onRetry={fetchUsers} /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Reports</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((u) => (
                        <TableRow key={u.user_id}>
                          <TableCell className="font-mono text-xs">#{u.user_id}</TableCell>
                          <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{u.email}</TableCell>
                          <TableCell className="text-sm capitalize">{u.role}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGES[u.status] || ""}`}>
                              {u.status}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{u.total_reports}</TableCell>
                          <TableCell className="text-right">
                            {u.status !== "deleted" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteTarget(u)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
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

      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); setDeleteError("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Deleting a user will deactivate their account and hide their profile without permanently removing records.
              {deleteTarget && (
                <span className="block mt-2 font-medium text-foreground">
                  {deleteTarget.first_name} {deleteTarget.last_name} ({deleteTarget.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <Alert variant="destructive" className="rounded-xl">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteError("") }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

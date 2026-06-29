"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ErrorState } from "@/components/shared/ErrorState"
import { api } from "@/lib/api"
import type { Report, ReportCategory } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ReportCategory[]

export default function AdminEditReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ReportCategory | "">("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.admin.listReports({ page: 1, limit: 100 })
      .then((data) => {
        const list = Array.isArray(data.reports) ? data.reports : []
        const found = list.find((r) => r.report_id === Number(id))
        if (!found) {
          setFetchError("Report not found")
          return
        }
        setReport(found)
        setDescription(found.description)
        setCategory(found.category)
        setLatitude(String(found.latitude))
        setLongitude(String(found.longitude))
        setAddress(found.address || "")
      })
      .catch((err: Error) => setFetchError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await api.reports.update(Number(id), {
        description,
        category,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || undefined,
      })
      router.push(`/admin/reports/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed")
    }
    setSubmitting(false)
  }

  if (loading) return <LoadingSpinner />
  if (fetchError) return <ErrorState message={fetchError} />
  if (!report) return <ErrorState message="Report not found" />

  return (
    <div>
      <Button variant="ghost" asChild className="mb-6 rounded-full">
        <Link href={`/admin/reports/${id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Report</Link>
      </Button>

      <h1 className="text-2xl font-bold font-heading mb-2">Edit Report #{report.report_id}</h1>
      <p className="text-muted-foreground mb-8">Update report details</p>

      {error && (
        <Alert variant="destructive" className="mb-6 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border-border/50 max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="rounded-xl resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
                <SelectTrigger id="category" className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="rounded-xl" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (optional)</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="rounded-full">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-full">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

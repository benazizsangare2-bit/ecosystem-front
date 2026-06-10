"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, AlertCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { PhotoUpload } from "@/components/reports/PhotoUpload"
import { Map } from "@/components/shared/Map"
import { DuplicateWarningModal } from "@/components/reports/DuplicateWarningModal"
import { api } from "@/lib/api"
import type { ReportCategory, ReportSummary } from "@/lib/types"
import { CATEGORY_LABELS } from "@/lib/types"

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ReportCategory[]

export default function CreateReportPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [photo, setPhoto] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ReportCategory | "">("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [duplicates, setDuplicates] = useState<ReportSummary[]>([])
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude) },
      () => {}
    )
  }, [])

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
  }, [])

  const steps = [
    {
      title: "Upload Photo",
      desc: "Take or upload a photo of the environmental issue",
      content: <PhotoUpload onFileChange={setPhoto} error={error.includes("photo") ? error : undefined} />,
      valid: !!photo,
    },
    {
      title: "Describe the Issue",
      desc: "Provide details about what you observed",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you saw, when, and any other relevant details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="rounded-xl resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
              <SelectTrigger id="category" className="rounded-xl">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      valid: description.trim().length > 0 && category !== "",
    },
    {
      title: "Pick Location",
      desc: "Click on the map or use auto-detect to mark the location",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm" onClick={detectLocation} className="rounded-full">
              <MapPin className="mr-2 h-4 w-4" /> Auto-Detect Location
            </Button>
            {latitude && longitude && (
              <span className="text-xs text-muted-foreground">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            )}
          </div>
          <div className="rounded-2xl overflow-hidden border border-border/50 h-64">
            <Map
              onClick={handleMapClick}
              selected={latitude && longitude ? { lat: latitude, lng: longitude, title: "Selected" } : undefined}
              className="h-full w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              placeholder="Street, neighborhood, or landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
      ),
      valid: latitude !== null && longitude !== null,
    },
    {
      title: "Review & Submit",
      desc: "Review your report before submitting",
      content: (
        <div className="space-y-4 text-sm">
          {photo && (
            <div className="rounded-xl overflow-hidden border border-border/50">
              <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-48 object-cover" />
            </div>
          )}
          <div>
            <p className="font-medium">Description</p>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="font-medium">Category</p>
              <p className="text-muted-foreground mt-1">{category ? CATEGORY_LABELS[category] : "—"}</p>
            </div>
            <div>
              <p className="font-medium">Location</p>
              <p className="text-muted-foreground mt-1">
                {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </p>
            </div>
          </div>
          {address && (
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground mt-1">{address}</p>
            </div>
          )}
        </div>
      ),
      valid: true,
    },
  ]

  const handleSubmit = async (submitAnyway = false) => {
    setError("")
    setLoading(true)
    try {
      const formData = new FormData()
      if (photo) formData.append("photo", photo)
      formData.append("description", description)
      formData.append("latitude", String(latitude))
      formData.append("longitude", String(longitude))
      formData.append("category", category)
      if (address) formData.append("address", address)

      const response = await api.reports.create(formData)
      if (!response) {
        throw new Error("Empty response from server")
      }
      const data = response as { report: { report_id: number }; possible_duplicates?: ReportSummary[]; duplicate_warning?: boolean }

      if (data.duplicate_warning && !submitAnyway && data.possible_duplicates?.length) {
        setDuplicates(data.possible_duplicates)
        setShowDuplicateModal(true)
        return
      }

      router.push(`/reports/${data.report.report_id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create report")
    }
    setLoading(false)
  }

  const current = steps[step]

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={() => step > 0 ? setStep((s) => s - 1) : router.back()} className="mb-6 rounded-full">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading">{current.title}</h1>
        <p className="text-muted-foreground mt-1">{current.desc}</p>
      </div>

      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-colors ${
              i <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-6">{current.content}</CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => step > 0 ? setStep((s) => s - 1) : router.back()}
          className="rounded-full"
        >
          {step === 0 ? "Cancel" : "Previous"}
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => current.valid && setStep((s) => s + 1)} disabled={!current.valid} className="rounded-full">
            Continue
          </Button>
        ) : (
          <Button onClick={() => handleSubmit()} disabled={loading || !photo} className="rounded-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        )}
      </div>

      <DuplicateWarningModal
        open={showDuplicateModal}
        duplicates={duplicates}
        onSubmitAnyway={() => { setShowDuplicateModal(false); handleSubmit(true) }}
        onCancel={() => setShowDuplicateModal(false)}
      />
    </div>
  )
}

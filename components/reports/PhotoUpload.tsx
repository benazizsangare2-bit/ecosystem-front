"use client"

import { useCallback, useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhotoUploadProps {
  onFileChange: (file: File | null) => void
  error?: string
}

export function PhotoUpload({ onFileChange, error }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) {
        setPreview(null)
        onFileChange(null)
        return
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        onFileChange(null)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        onFileChange(null)
        return
      }
      setPreview(URL.createObjectURL(file))
      onFileChange(file)
    },
    [onFileChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      handleFile(file || null)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0] || null)
    },
    [handleFile]
  )

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer",
          dragOver
            ? "border-primary bg-primary/5"
            : error
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
        onClick={() => document.getElementById("photo-input")?.click()}
      >
        {preview ? (
          <div className="relative w-full max-w-sm">
            <img
              src={preview}
              alt="Preview"
              className="rounded-xl w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPreview(null)
                onFileChange(null)
              }}
              className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 shadow-sm hover:bg-background transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Drag & drop or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">JPG or PNG, max 5MB</p>
          </>
        )}
        <input
          id="photo-input"
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

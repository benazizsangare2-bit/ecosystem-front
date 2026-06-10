"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else if (!loading && !isAdmin) {
      router.replace("/dashboard")
    }
  }, [loading, isAuthenticated, isAdmin, router, pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 bg-background">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("No verification token provided.")
      return
    }
    api.auth.verifyEmail(token)
      .then(() => { setStatus("success"); setMessage("Email verified successfully!") })
      .catch((err: Error) => { setStatus("error"); setMessage(err.message || "Verification failed") })
  }, [token])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-border/50 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === "loading" ? (
              <div className="rounded-full bg-primary/10 p-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : status === "success" ? (
              <div className="rounded-full bg-emerald-100 p-3"><CheckCircle className="h-8 w-8 text-emerald-600" /></div>
            ) : (
              <div className="rounded-full bg-red-100 p-3"><XCircle className="h-8 w-8 text-red-600" /></div>
            )}
          </div>
          <CardTitle className="text-2xl font-heading">
            {status === "loading" ? "Verifying..." : status === "success" ? "Verified!" : "Verification Failed"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <Button asChild className="rounded-full"><Link href="/login">Go to Login</Link></Button>
          ) : status === "error" ? (
            <Button asChild variant="outline" className="rounded-full"><Link href="/">Back to Home</Link></Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}><VerifyContent /></Suspense>
}

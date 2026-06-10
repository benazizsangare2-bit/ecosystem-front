"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Leaf, Mail, Lock, User, Phone, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

const PHONE_REGEX = /^(\+243|0)[89]\d{8}$/

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", phone_number: "", password: "", confirmPassword: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.email.includes("@")) errs.email = "Valid email required"
    if (!PHONE_REGEX.test(form.phone_number)) errs.phone_number = "DRC format: +2438XXXXXXXX or 08XXXXXXXX"
    if (form.password.length < 6) errs.password = "Min 6 characters"
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match"
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setError("")
    setLoading(true)
    try {
      await register({
        email: form.email,
        name: form.name,
        phone_number: form.phone_number,
        password: form.password,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed"
      setError(msg)
    }
    setLoading(false)
  }

  const set = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: "" }))
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md rounded-2xl border-border/50 text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading">Check Your Email</CardTitle>
            <CardDescription>
              We&apos;ve sent a verification link to <strong>{form.email}</strong>. Please click it to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fields = [
    { key: "name", label: "Full Name", icon: User, placeholder: "Jean Mukendi", type: "text" },
    { key: "email", label: "Email", icon: Mail, placeholder: "you@example.com", type: "email" },
    { key: "phone_number", label: "Phone Number", icon: Phone, placeholder: "+243812345678", type: "tel" },
    { key: "password", label: "Password", icon: Lock, placeholder: "Min 6 characters", type: "password" },
    { key: "confirmPassword", label: "Confirm Password", icon: Lock, placeholder: "Repeat password", type: "password" },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-2xl border-border/50 shadow-xl shadow-primary/5">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading">Create Account</CardTitle>
          <CardDescription>Join the Ecosystem community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>{label}</Label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={key}
                    type={type}
                    placeholder={placeholder}
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    className={`pl-10 rounded-xl ${fieldErrors[key] ? "border-destructive" : ""}`}
                    required
                  />
                </div>
                {fieldErrors[key] && <p className="text-xs text-destructive">{fieldErrors[key]}</p>}
              </div>
            ))}
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

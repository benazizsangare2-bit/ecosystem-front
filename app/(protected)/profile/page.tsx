"use client"

import { useState } from "react"
import { User, Mail, Phone, Award, Calendar, Lock, Save, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { api } from "@/lib/api"

const BADGES = [
  { min: 501, label: "Hero", color: "text-amber-600", bg: "bg-amber-100" },
  { min: 201, label: "Guardian", color: "text-emerald-600", bg: "bg-emerald-100" },
  { min: 51, label: "Contributor", color: "text-blue-600", bg: "bg-blue-100" },
  { min: 0, label: "Newcomer", color: "text-gray-600", bg: "bg-gray-100" },
]

function getBadge(score: number) {
  return BADGES.find((b) => score >= b.min) || BADGES[BADGES.length - 1]
}

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwError, setPwError] = useState("")
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError("")
    setPwSuccess(false)
    if (newPassword.length < 6) { setPwError("Password must be at least 6 characters"); return }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match"); return }
    setPwLoading(true)
    try {
      await api.auth.changePassword(oldPassword, newPassword)
      setPwSuccess(true)
      setOldPassword(""); setNewPassword(""); setConfirmPassword("")
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Failed to change password")
    }
    setPwLoading(false)
  }

  if (!user) return null

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
  const badge = getBadge(user.reputation_score)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold font-heading mb-8">Profile & Settings</h1>

      <Card className="rounded-2xl border-border/50 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.color}`}>
                  <Award className="h-3 w-3 mr-1" /> {badge.label} &middot; {user.reputation_score} pts
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">First Name</Label>
                <p className="font-medium flex items-center gap-2 mt-1"><User className="h-3 w-3 text-muted-foreground" /> {user.first_name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Last Name</Label>
                <p className="font-medium flex items-center gap-2 mt-1"><User className="h-3 w-3 text-muted-foreground" /> {user.last_name}</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium flex items-center gap-2 mt-1"><Mail className="h-3 w-3 text-muted-foreground" /> {user.email}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <p className="font-medium flex items-center gap-2 mt-1"><Phone className="h-3 w-3 text-muted-foreground" /> {user.phone_number}</p>
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <p className="font-medium mt-1 capitalize">{user.role}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Member since</Label>
                <p className="font-medium flex items-center gap-2 mt-1"><Calendar className="h-3 w-3 text-muted-foreground" /> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-xs text-muted-foreground">Total Reports</Label>
              <p className="font-medium mt-1">{user.total_reports}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {pwError && <Alert variant="destructive" className="rounded-xl"><AlertCircle className="h-4 w-4" /><AlertDescription>{pwError}</AlertDescription></Alert>}
              {pwSuccess && <Alert className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800"><CheckCircle className="h-4 w-4" /><AlertDescription>Password updated successfully!</AlertDescription></Alert>}
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="rounded-xl" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="rounded-xl" required />
                </div>
              </div>
              <Button type="submit" disabled={pwLoading} className="rounded-full">
                {pwLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {pwLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Toggle between light, dark, or system theme</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

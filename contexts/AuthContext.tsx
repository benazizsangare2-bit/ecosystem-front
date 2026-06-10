"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { api } from "@/lib/api"
import { setAuthCookies, clearAuthCookies } from "@/lib/cookies"

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; name: string; phone_number: string; password: string }) => Promise<{ user_id: number }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("auth_token")
    if (stored) {
      setToken(stored)
      const storedUser = localStorage.getItem("auth_user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch { /* ignore */ }
      }
      const expiresAt = localStorage.getItem("auth_expires_at")
      if (expiresAt && Date.now() > Number(expiresAt)) {
        clearAuth()
        if (typeof window !== "undefined") {
          window.location.href = "/login?expired=1"
        }
        return
      }
      api.profile.get().then((u) => { if (u) setUser(u) }).catch(() => clearAuth()).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function clearAuth() {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_expires_at")
    clearAuthCookies()
    setToken(null)
    setUser(null)
  }

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login({ email, password })
    if (!data || !data.access_token) {
      throw new Error("Invalid login response from server")
    }
    localStorage.setItem("auth_token", data.access_token)
    localStorage.setItem("auth_user", JSON.stringify(data.user))
    localStorage.setItem("auth_expires_at", String(data.expires_in * 1000))
    setAuthCookies(data.access_token, data.user.role)
    setToken(data.access_token)
    setUser(data.user)
  }, [])

  const register = useCallback(async (data: { email: string; name: string; phone_number: string; password: string }) => {
    return api.auth.register(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch { /* ignore */ }
    clearAuth()
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const u = await api.profile.get()
      if (u) {
        setUser(u)
        localStorage.setItem("auth_user", JSON.stringify(u))
      }
    } catch { /* ignore */ }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === "admin" || user?.role === "authority",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

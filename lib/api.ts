import type {
  AdminStats,
  AdminUserListResponse,
  AuditLogsResponse,
  Comment,
  CreateReportResponse,
  LoginResponse,
  PrintableReport,
  PublicReportsPage,
  Report,
  User,
} from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

const inflight = new Map<string, Promise<unknown>>()

function dedupGet<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key)
  if (existing) return existing as Promise<T>
  const promise = factory().finally(() => inflight.delete(key))
  inflight.set(key, promise)
  return promise
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`
  return headers
}

async function handleResponse<T>(res: Response): Promise<T> {
  let json: unknown
  try {
    json = await res.json()
  } catch {
    const text = await res.text().catch(() => "")
    throw Object.assign(new Error(text || `HTTP ${res.status}`), { code: res.status })
  }
  const body = json as Record<string, unknown>
  if (!res.ok || body.success === false) {
    const msg = (body.error as string) || (body.message as string) || `HTTP ${res.status}`
    const err = new Error(msg) as Error & { code: number; data?: unknown }
    err.code = (body.code as number) || res.status
    err.data = body
    throw err
  }
  if ("success" in body && "data" in body) {
    return body.data as T
  }
  return json as T
}

export const api = {
  auth: {
    register: (body: { email: string; name: string; phone_number: string; password: string }) =>
      fetch(`${BASE_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(handleResponse<{ user_id: number }>),

    login: (body: { email: string; password: string }) =>
      fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(handleResponse<LoginResponse>),

    logout: () =>
      fetch(`${BASE_URL}/api/logout`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      }).then(handleResponse<null>),

    verifyEmail: (token: string) =>
      fetch(`${BASE_URL}/api/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).then(handleResponse<null>),

    forgotPassword: (email: string) =>
      fetch(`${BASE_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then(handleResponse<null>),

    resetPassword: (token: string, new_password: string) =>
      fetch(`${BASE_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password }),
      }).then(handleResponse<null>),

    changePassword: (old_password: string, new_password: string) =>
      fetch(`${BASE_URL}/api/change-password`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ old_password, new_password }),
      }).then(handleResponse<null>),
  },

  profile: {
    get: () =>
      dedupGet("GET /api/profile", () =>
        fetch(`${BASE_URL}/api/profile`, {
          headers: getAuthHeaders(),
        }).then(handleResponse<User>),
      ),
    deleteAccount: () =>
      fetch(`${BASE_URL}/api/profile`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }).then(handleResponse<null>),
  },

  reports: {
    create: (formData: FormData) =>
      fetch(`${BASE_URL}/api/reports`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      }).then(handleResponse<CreateReportResponse & { report: Report }>),

    getMyReports: () =>
      fetch(`${BASE_URL}/api/reports/user`, {
        headers: getAuthHeaders(),
      }).then(handleResponse<Report[]>),

    getMyReport: (id: number) =>
      fetch(`${BASE_URL}/api/reports/${id}`, {
        headers: getAuthHeaders(),
      }).then(handleResponse<Report>),

    update: (id: number, body: Record<string, unknown>) =>
      fetch(`${BASE_URL}/api/reports/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(handleResponse<Report>),

    delete: (id: number) =>
      fetch(`${BASE_URL}/api/reports/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }).then(handleResponse<null>),

    getPublic: (page = 1, limit = 20) =>
      fetch(`${BASE_URL}/api/reports/public?page=${page}&limit=${limit}`, {
        headers: getAuthHeaders(),
      })
        .then(handleResponse<PublicReportsPage>)
        .then((data) => {
          if (!data.total && data.reports) data.total = data.reports.length
          return data
        }),

    getPublicDetail: (id: number) =>
      fetch(`${BASE_URL}/api/reports/public/${id}`).then(handleResponse<Report>),

    getComments: (id: number) =>
      dedupGet(`GET /api/reports/${id}/comments`, () =>
        fetch(`${BASE_URL}/api/reports/${id}/comments`).then(handleResponse<Comment[]>),
      ),

    addComment: (id: number, content: string) =>
      fetch(`${BASE_URL}/api/reports/${id}/comments`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }).then(handleResponse<Comment>),

    toggleLike: (id: number) =>
      fetch(`${BASE_URL}/api/reports/${id}/like`, {
        method: "POST",
        headers: getAuthHeaders(),
      }).then(handleResponse<{ liked: boolean; upvote_count: number }>),

    getPrintable: (id: number) =>
      dedupGet(`GET /api/reports/${id}/printable`, () =>
        fetch(`${BASE_URL}/api/reports/${id}/printable`, {
          headers: getAuthHeaders(),
        }).then(handleResponse<PrintableReport>),
      ),
  },

  admin: {
    getStats: () =>
      fetch(`${BASE_URL}/api/admin/stats`, {
        headers: getAuthHeaders(),
      }).then(handleResponse<AdminStats>),

    listReports: (params?: {
      status?: string
      category?: string
      from?: string
      to?: string
      page?: number
      limit?: number
    }) => {
      const search = new URLSearchParams()
      if (params?.status) search.set("status", params.status)
      if (params?.category) search.set("category", params.category)
      if (params?.from) search.set("from", params.from)
      if (params?.to) search.set("to", params.to)
      if (params?.page) search.set("page", String(params.page))
      if (params?.limit) search.set("limit", String(params.limit))
      const qs = search.toString()
      const url = `${BASE_URL}/api/admin/reports${qs ? `?${qs}` : ""}`
      return dedupGet(`GET ${url}`, () =>
        fetch(url, {
          headers: getAuthHeaders(),
        }).then(handleResponse<{ reports: Report[]; page: number; limit: number; total: number }>),
      )
    },

    updateStatus: (id: number, body: { status: string; admin_notes?: string; duplicate_of?: number | null }) =>
      fetch(`${BASE_URL}/api/admin/reports/${id}/status`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(handleResponse<Report>),

    getAuditLogs: (params?: {
      page?: number
      limit?: number
      action?: string
      target_type?: string
      from?: string
      to?: string
    }) => {
      const search = new URLSearchParams()
      if (params?.page) search.set("page", String(params.page))
      if (params?.limit) search.set("limit", String(params.limit))
      if (params?.action) search.set("action", params.action)
      if (params?.target_type) search.set("target_type", params.target_type)
      if (params?.from) search.set("from", params.from)
      if (params?.to) search.set("to", params.to)
      const qs = search.toString()
      const url = `${BASE_URL}/api/admin/auditlogs${qs ? `?${qs}` : ""}`
      return fetch(url, {
        headers: getAuthHeaders(),
      }).then(handleResponse<AuditLogsResponse>)
    },

    getAuditLogActions: () =>
      fetch(`${BASE_URL}/api/admin/auditlogs/actions`, {
        headers: getAuthHeaders(),
      }).then(handleResponse<string[]>),

    listUsers: (params?: { status?: string; page?: number; limit?: number }) => {
      const search = new URLSearchParams()
      if (params?.status) search.set("status", params.status)
      if (params?.page) search.set("page", String(params.page))
      if (params?.limit) search.set("limit", String(params.limit))
      const qs = search.toString()
      const url = `${BASE_URL}/api/admin/users${qs ? `?${qs}` : ""}`
      return fetch(url, {
        headers: getAuthHeaders(),
      }).then(handleResponse<AdminUserListResponse>)
    },

    deleteUser: (id: number) =>
      fetch(`${BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      }).then(handleResponse<null>),

    getSystemReport: (params?: { from?: string; to?: string }) => {
      const search = new URLSearchParams()
      if (params?.from) search.set("from", params.from)
      if (params?.to) search.set("to", params.to)
      const qs = search.toString()
      const url = `${BASE_URL}/api/admin/system-report${qs ? `?${qs}` : ""}`
      return fetch(url, {
        headers: getAuthHeaders(),
      }).then(handleResponse<SystemReportResponse>)
    },

    downloadSystemReportPdf: (params?: { from?: string; to?: string }) => {
      const search = new URLSearchParams()
      if (params?.from) search.set("from", params.from)
      if (params?.to) search.set("to", params.to)
      const qs = search.toString()
      const url = `${BASE_URL}/api/admin/system-report/pdf${qs ? `?${qs}` : ""}`
      return fetch(url, {
        headers: getAuthHeaders(),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.text().catch(() => "")
          throw new Error(body || `HTTP ${res.status}`)
        }
        const blob = await res.blob()
        return blob
      })
    },
  },
}

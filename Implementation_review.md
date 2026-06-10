# Implementation Review — Ecosystem Frontend
DO NOT use the default AI-shadcn template design. Make it look unique: use warm earthy greens (#2d5a27, #4a7c3f) and natural tones, rounded corners (border-radius: 12px), custom shadows, organic shapes, and a nature-focused aesthetic with leaf/forest accents. Avoid: purple gradients, centered card layouts with glassmorphism, dark gray backgrounds, and generic SaaS dashboard styling.


## Understanding

### What Needs to Be Built
A complete Next.js 16.2.6 frontend (App Router, Tailwind CSS v4, TypeScript) for a Go/Gin environmental reporting backend. The app is called **Ecosystem**. It allows citizens to report environmental issues (illegal dumping, water contamination, etc.) with photos and location, and allows admins to review, investigate, and resolve those reports.

### Existing Project State
- Fresh `create-next-app` scaffold with Tailwind CSS v4 and TypeScript
- Next.js **16.2.6** (breaking changes from earlier versions documented)
- Backend runs on `http://localhost:3030`
- `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3030`

### Backend API (OpenAPI Summary)
- **Auth**: Register, Login (returns JWT), Logout (blacklists JWT), Verify Email (POST/GET), Forgot/Reset Password, Change Password
- **Profile**: GET /api/profile (auth required)
- **Reports**: CRUD for user's own reports; public feed of `investigating` reports (paginated);
- **Social**: Comments (get/post on investigating reports), Like toggle
- **Admin**: List all reports with filters (status, category, date range), Update report status + notes + mark duplicate, Dashboard stats, Audit log

### Response Envelope
- Success: `{ success: true, data: ..., message: "..." }`
- Error: `{ success: false, error: "...", code: 400 }`

### Authentication Flow
1. Register → email verification link → Login → JWT token
2. JWT used as `Authorization: Bearer <token>` header
3. Login response: `{ access_token, token_type: "Bearer", expires_in (unix ts), user }`
4. No refresh token endpoint exists — token valid for `JWT_EXPIRY_HOURS` (default 24h)

### Route Structure
| Type | Routes |
|------|--------|
| Public | `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/reports/public`, `/reports/:id/public` |
| Protected (auth) | `/dashboard`, `/reports/create`, `/reports/:id/edit`, `/reports/:id`, `/profile`, `/notifications` |
| Admin (auth + role) | `/admin`, `/admin/reports`, `/admin/reports/:id`, `/admin/audit` |

### Key Business Rules
- Reports can only be edited/deleted when `status === "pending"`
- Comments and likes only allowed when `status === "investigating"`
- Duplicate detection on creation: `manual` / `auto_flag` (default, shows warning) / `auto_reject`
- Status flow: `pending → under_review → investigating → resolved/rejected/duplicate`
- Reputation: +10 for investigating, -5 for duplicate, +1 per upvote received
- Photo constraints: max 5MB, jpg/jpeg/png, min 200×200px
- Phone: DRC format `+243XXXXXXXXX` (9 digits, starts with 8 or 9)

---

## Points of Confusion / Additional Information Needed

### 1. Middleware → Proxy (Next.js 16)
Next.js 16 renamed `middleware.ts` to `proxy.ts` and the exported function from `middleware` to `proxy`. The proxy cannot use Edge runtime. I'll implement route protection here.

**Question**: Should I use `proxy.ts` at root level for route protection, or use a client-side wrapper/layout approach for auth gating? The proxy approach is more secure (server-side check).
**Answer**: Yes use the proxy approach

### 2. JWT Storage Strategy
The API returns `access_token` in the JSON body. There's no `Set-Cookie` header from the backend for httpOnly cookies.

**Options**:
- **localStorage**: Simple but XSS-vulnerable. The user suggests "short expiry" to mitigate.
- **Client-set cookie**: After login, set a cookie from the client (non-httpOnly, accessible to JS) — similar risk profile.
- **httpOnly cookie proxy**: Create a Next.js API route that receives the token and sets an httpOnly cookie, then the proxy validates it.

**My recommendation**: Store in memory + localStorage as fallback. The proxy.ts can validate by attaching the Authorization header from a cookie. This requires a Next.js route handler that receives the token and sets it as an httpOnly cookie. But the user also says "Implement token refresh mechanism" — there's no refresh endpoint in the API.

**Answer**: Just use local storage with short expiry time as mitigation, it is fine for this project.

**Question**: How should I handle JWT storage? The API only returns a Bearer token in JSON — should I create a Next.js API route to exchange the JWT for an httpOnly cookie, or store in localStorage with a client-side context?
**Answer**: Use localStorage with client-side context. Don't overcomplicate it.

### 3. Map Library
**Question**: Which map library should I use?
- **Leaflet** (react-leaflet) — free, OpenStreetMap tiles, well-documented, works offline
- **Mapbox GL JS** — requires API key, more polished
- Given the app is for DRC (possibly limited internet), Leaflet seems more appropriate. Confirmation?
**Answer**: Confirmed

### 4. Photo URLs / Uploads Serving
The `Report` schema has `photo_urls` and `thumbnail_urls` as relative paths like `abc.jpg`. 

**Question**: Does the backend serve these files statically? I.e., are they accessible at `http://localhost:3030/uploads/abc.jpg`? I need to know the full URL pattern.
**Answer**: Yes, the backend serves these files statically. The full URL pattern is `http://localhost:3030/uploads/abc.jpg`.

### 5. Admin Audit Log Endpoint
The route spec mentions `/admin/audit` and `Audit Log Viewer` in the user journey, but I don't see a `GET /api/admin/audit` endpoint in the OpenAPI spec. 

**Question**: Is there an audit log endpoint, or does it need to be added?
**Answer**: You are right, the endpoint is not implemented yet. Just build and use the endpoints while I implement it in the backend .

### 6. Token Refresh / Expiry
The `expires_in` field is a Unix timestamp. There's no refresh token endpoint.

**Question**: How should token refresh work? Without a refresh endpoint, the user would need to re-login after expiry. Should I implement a silent refresh (re-login with stored credentials) or just redirect to login?
**Answer**: Redirec to login upon expiry

### 7. Pagination in Public Reports
`GET /api/reports/public` supports `page` and `limit` params, but the response lacks a `total` field in the OpenAPI spec (the `PublicReportsPage` schema doesn't include `total`). The `AdminReportsPage` does include `total`.

**Question**: Does the public reports endpoint actually return `total` in the response, or should I check?
**Answer**: Better check it please. Also confirm it returns descending order, that way i can display the most recent reports first.

### 8. Comments Visibility (Unauthenticated)
`GET /api/reports/{id}/comments` has no security requirement — so comments on investigating reports are publicly readable. Correct?
**Answer**: Yes, comments are publicly readable.

### 9. Report Visibility for Public
The public report detail page (`/reports/:id/public`) — is this a separate endpoint? The spec only shows `GET /api/reports/{id}` which requires auth and only returns the owner's report. 

**Question**: Is there a public endpoint for viewing a single report's details without auth? If not, the public detail page would need to rely on data already loaded from the public feed, which is limited to summary data.
**Answer**: I will add a public endpoint at the address "/api/reports/public/:id".

### 10. Shadcn/UI Setup
shadcn is **not a dependency** you `npm install`. It's a CLI tool (`npx shadcn@latest init`) that adds component source files to your project under `components/ui/`. You then import them directly like `import { Button } from "@/components/ui/button"`. Each component is a separate file you can customize.

**Question**: Do you want shadcn installed, or should I build custom UI components? If shadcn, I need to run its init command which will ask questions about style/color/base color.
**Answer**: Yes use shadcn, install it please.

### 11. Dark Mode
Tailwind v4 has built-in dark mode support. The current globals.css uses `@media (prefers-color-scheme: dark)`.

**Question**: Should the app support dark mode toggle, or just follow system preference?
**Answer**: should support both system preference and dark mode toggle in the settings.

### 12. Category Display Names
The categories are snake_case (e.g., `illegal_dumping`, `overflowing_waste`).

**Question**: Should I use these raw values in the UI, or map them to human-readable labels (e.g., "Illegal Dumping", "Overflowing Waste")?

**Answer**: Map them to human-readable labels.
---

## Clarifications Needed Before Starting

1. **JWT storage approach** — localStorage vs. httpOnly cookie via Next.js API route?
2. **Map library preference** — Leaflet or Mapbox?
3. **Upload URL pattern** — confirm `http://localhost:3030/uploads/<filename>`?
4. **Admin audit log endpoint** — confirm endpoint path or if it exists?
5. **Token refresh strategy** — re-login or redirect on expiry?
6. **Public report detail** — is there an unauthenticated endpoint for a single report?
7. **Dark mode** — system preference only, or toggle?
8. **Shadcn initialization** — run the CLI, or build custom components?
9. **Photo re-upload on edit** — the update endpoint accepts JSON, not multipart. Can photos be changed on edit?
10. **Notification endpoint** — the user journey mentions `/notifications` page and notification preferences, but I don't see API endpoints for notifications. Are these planned or existing?

// Add settings for users to modify their settings, change password, toggle dark mode and other necessary ones.
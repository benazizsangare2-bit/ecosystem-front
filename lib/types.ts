export type UserRole = "citizen" | "admin" | "authority";
export type UserStatus = "active" | "suspended" | "banned";
export type ReportCategory =
  | "illegal_dumping"
  | "overflowing_waste"
  | "air_pollution"
  | "water_contamination"
  | "noise_pollution"
  | "deforestation"
  | "bad_roads"
  | "other";
export type ReportStatus =
  | "pending"
  | "under_review"
  | "investigating"
  | "resolved"
  | "rejected"
  | "duplicate";

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  illegal_dumping: "Illegal Dumping or overflowing waste ",
  overflowing_waste: "Overflowing Waste",
  air_pollution: "Air Pollution",
  water_contamination: "Water Contamination",
  noise_pollution: "Noise Pollution",
  deforestation: "Deforestation",
  bad_roads: "Bad Roads",
  other: "Other",
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  under_review: "bg-sky-100 text-sky-800 border-sky-300",
  investigating: "bg-emerald-100 text-emerald-800 border-emerald-300",
  resolved: "bg-violet-100 text-violet-800 border-violet-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  duplicate: "bg-orange-100 text-orange-800 border-orange-300",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  investigating: "Investigating",
  resolved: "Resolved",
  rejected: "Rejected",
  duplicate: "Duplicate",
};

export interface User {
  user_id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_email_verified: boolean;
  reputation_score: number;
  total_reports: number;
  status: UserStatus;
  created_at: string;
}

export interface ReportSummary {
  report_id: number;
  title: string;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Report {
  report_id: number;
  user_id: number;
  title: string;
  description: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_urls: string[];
  thumbnail_urls: string[];
  status: ReportStatus;
  duplicate_of: number | null;
  duplicate_warning: boolean;
  admin_notes: string | null;
  upvote_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  comment_id: number;
  report_id: number;
  user_id: number;
  author_name: string;
  comment: string;
  is_official_response: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface CreateReportResponse {
  report: Report;
  possible_duplicates: ReportSummary[];
  duplicate_warning: boolean;
}

export interface PublicReportsPage {
  reports: Report[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminStats {
  total_reports: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  recent_reports_7d: number;
  duplicate_warnings: number;
}

export interface AuditLog {
  log_id: number;
  admin_id: number;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: number;
  old_data: string;
  new_data: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  message: string;
}

export interface ErrorEnvelope {
  success: false;
  error: string;
  code: number;
}

export type ApiResponse<T> = SuccessEnvelope<T> | ErrorEnvelope;

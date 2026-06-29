"use client"

import { useEffect, useState, use } from "react"
import { useSearchParams } from "next/navigation"
import { Printer, Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api } from "@/lib/api"
import type { PrintableReport } from "@/lib/types"
import { CATEGORY_LABELS, STATUS_LABELS, type ReportStatus } from "@/lib/types"

export default function PrintPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const [data, setData] = useState<PrintableReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const config = {
    recipient: searchParams.get("recipient") || "",
    purpose: searchParams.get("purpose") || "",
    notes: searchParams.get("notes") || "",
    images: searchParams.get("images") !== "false",
    stats: searchParams.get("stats") !== "false",
    timeline: searchParams.get("timeline") !== "false",
    adminNotes: searchParams.get("adminNotes") !== "false",
    rejection: searchParams.get("rejection") !== "false",
    duplicate: searchParams.get("duplicate") !== "false",
    reporter: searchParams.get("reporter") !== "false",
  }

  useEffect(() => {
    setLoading(true)
    setError("")
    api.reports.getPrintable(Number(id))
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-bold">Failed to Load Report</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => window.history.back()} className="rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { report, timeline, statistics, attachments, reference_number, case_number, generated_at } = data
  const photoUrls = report.photo_urls || []
  const isRejected = report.status === "rejected"
  const hasDuplicate = report.duplicate_of !== null

  return (
    <>
      <div className="no-print fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background border-b border-border/50 px-4 py-3">
        <Button variant="ghost" onClick={() => window.history.back()} className="rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-sm font-medium hidden sm:block">Print Preview</h1>
        <Button onClick={() => window.print()} className="rounded-full">
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
      </div>

      <div className="print-container pt-16">
        <div className="print-page">
          <header className="print-header">
            <div className="print-title-section">
              <h1 className="print-main-title">ENVIRONMENTAL INCIDENT REPORT</h1>
              <p className="print-subtitle">EnvTrack - Official Document</p>
            </div>
            <div className="print-ref-section">
              <table className="print-ref-table">
                <tbody>
                  <tr><td className="font-semibold pr-2">Reference:</td><td>{reference_number}</td></tr>
                  <tr><td className="font-semibold pr-2">Case No:</td><td>{case_number}</td></tr>
                  <tr><td className="font-semibold pr-2">Date:</td><td>{new Date(generated_at).toLocaleString()}</td></tr>
                  <tr><td className="font-semibold pr-2">Report ID:</td><td>#{report.report_id}</td></tr>
                </tbody>
              </table>
            </div>
          </header>

          <div className="print-divider" />

          <section className="print-section">
            <h2 className="print-section-title">Report Summary</h2>
            <table className="print-data-table">
              <tbody>
                <tr><td className="font-semibold w-40">Title</td><td>{report.title}</td></tr>
                <tr><td className="font-semibold">Status</td><td>{STATUS_LABELS[report.status as ReportStatus] || report.status}</td></tr>
                <tr><td className="font-semibold">Category</td><td>{CATEGORY_LABELS[report.category] || report.category}</td></tr>
                <tr><td className="font-semibold">Location</td><td>{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}{report.address ? ` - ${report.address}` : ""}</td></tr>
                <tr><td className="font-semibold">Submitted</td><td>{new Date(report.created_at).toLocaleString()}</td></tr>
                <tr><td className="font-semibold">Upvotes</td><td>{report.upvote_count}</td></tr>
                <tr><td className="font-semibold">Views</td><td>{report.view_count}</td></tr>
              </tbody>
            </table>
          </section>

          <section className="print-section">
            <h2 className="print-section-title">Description</h2>
            <p className="print-body-text">{report.description}</p>
          </section>

          {config.adminNotes && report.admin_notes && (
            <section className="print-section">
              <h2 className="print-section-title">Admin Notes</h2>
              <div className="print-note-box">
                <p>{report.admin_notes}</p>
              </div>
            </section>
          )}

          {config.rejection && isRejected && report.resolved_at && (
            <section className="print-section">
              <h2 className="print-section-title">Rejection Reason</h2>
              <div className="print-note-box print-note-box-warning">
                <p>This report was rejected on {new Date(report.resolved_at).toLocaleString()}.</p>
                {report.admin_notes && <p className="mt-1">Reason: {report.admin_notes}</p>}
              </div>
            </section>
          )}

          {config.duplicate && hasDuplicate && (
            <section className="print-section">
              <h2 className="print-section-title">Duplicate Information</h2>
              <div className="print-note-box print-note-box-warning">
                <p>This report has been identified as a duplicate of Report #{report.duplicate_of}.</p>
                {report.duplicate_of_title && <p className="mt-1">Original: {report.duplicate_of_title}</p>}
                {report.duplicate_of_address && <p className="mt-1">Location: {report.duplicate_of_address}</p>}
              </div>
            </section>
          )}

          {config.reporter && (
            <section className="print-section">
              <h2 className="print-section-title">Reporter Information</h2>
              <table className="print-data-table">
                <tbody>
                  <tr><td className="font-semibold w-40">Name</td><td>{report.reporter_first_name} {report.reporter_last_name}</td></tr>
                  {report.reporter_email && <tr><td className="font-semibold">Email</td><td>{report.reporter_email}</td></tr>}
                  {report.reporter_phone_number && <tr><td className="font-semibold">Phone</td><td>{report.reporter_phone_number}</td></tr>}
                </tbody>
              </table>
            </section>
          )}

          {config.images && photoUrls.length > 0 && (
            <section className="print-section">
              <h2 className="print-section-title">Evidence ({photoUrls.length})</h2>
              <div className="print-image-grid">
                {photoUrls.map((url, i) => (
                  <div key={i} className="print-image-wrapper">
                    <img src={`/uploads/${url}`} alt={`Evidence ${i + 1}`} className="print-image" />
                    <p className="print-image-caption">Photo {i + 1}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {config.timeline && timeline.length > 0 && (
            <section className="print-section">
              <h2 className="print-section-title">Timeline</h2>
              <table className="print-timeline-table">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Changed By</th>
                    <th className="text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((entry) => (
                    <tr key={entry.history_id}>
                      <td className="text-sm">{new Date(entry.created_at).toLocaleString()}</td>
                      <td className="text-sm">{STATUS_LABELS[entry.status as ReportStatus] || entry.status}</td>
                      <td className="text-sm">{entry.changed_by_name || "System"}</td>
                      <td className="text-sm">{entry.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {config.stats && (
            <section className="print-section">
              <h2 className="print-section-title">Statistics</h2>
              <table className="print-data-table">
                <tbody>
                  <tr><td className="font-semibold w-40">Age</td><td>{statistics.age_in_days} days</td></tr>
                  {statistics.time_to_resolution_hours !== undefined && (
                    <tr><td className="font-semibold">Resolution Time</td><td>{statistics.time_to_resolution_hours} hours</td></tr>
                  )}
                </tbody>
              </table>

              {statistics.upvote_trend && statistics.upvote_trend.length > 0 && (
                <div className="mt-4">
                  <h3 className="print-subsection-title">Upvote Trend</h3>
                  <table className="print-timeline-table">
                    <thead>
                      <tr>
                        <th className="text-left">Week</th>
                        <th className="text-right">Upvotes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statistics.upvote_trend.map((w, i) => (
                        <tr key={i}>
                          <td className="text-sm">{new Date(w.week).toLocaleDateString()}</td>
                          <td className="text-sm text-right">{w.upvotes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {config.purpose && (
            <section className="print-section">
              <h2 className="print-section-title">Purpose</h2>
              <p className="print-body-text">{config.purpose}</p>
            </section>
          )}

          {config.recipient && (
            <section className="print-section">
              <h2 className="print-section-title">Recipient</h2>
              <p className="print-body-text">{config.recipient}</p>
            </section>
          )}

          {config.notes && (
            <section className="print-section">
              <h2 className="print-section-title">Additional Notes</h2>
              <p className="print-body-text">{config.notes}</p>
            </section>
          )}

          <div className="print-divider" />

          <footer className="print-footer">
            <p>This document was generated by EnvTrack on {new Date(generated_at).toLocaleString()}.</p>
            <p className="print-footer-ref">Reference: {reference_number} | Case: {case_number}</p>
            <p className="print-footer-disclaimer">This is an official environmental report document.</p>
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm 15mm;
          }
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-container { padding-top: 0 !important; }
        }
        .print-container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          color: black;
        }
        .print-page {
          padding: 30px 35px;
          font-family: 'Georgia', 'Times New Roman', serif;
          line-height: 1.6;
          color: #1a1a1a;
        }
        .print-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .print-main-title {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0;
          color: #000;
        }
        .print-subtitle {
          font-size: 12px;
          color: #666;
          margin: 4px 0 0 0;
        }
        .print-ref-table {
          font-size: 11px;
          border-collapse: collapse;
        }
        .print-ref-table td {
          padding: 2px 0;
          vertical-align: top;
        }
        .print-divider {
          border-top: 2px solid #000;
          margin: 20px 0;
        }
        .print-section {
          margin-bottom: 24px;
          page-break-inside: avoid;
        }
        .print-section-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 10px 0;
          padding-bottom: 4px;
          border-bottom: 1px solid #ccc;
          color: #000;
        }
        .print-subsection-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #333;
        }
        .print-body-text {
          font-size: 13px;
          margin: 0;
          line-height: 1.7;
        }
        .print-data-table {
          width: 100%;
          font-size: 13px;
          border-collapse: collapse;
        }
        .print-data-table td {
          padding: 4px 8px;
          vertical-align: top;
        }
        .print-timeline-table {
          width: 100%;
          font-size: 13px;
          border-collapse: collapse;
        }
        .print-timeline-table th {
          padding: 6px 8px;
          border-bottom: 1px solid #999;
          font-size: 12px;
          text-transform: uppercase;
          color: #333;
        }
        .print-timeline-table td {
          padding: 5px 8px;
          border-bottom: 1px solid #ddd;
        }
        .print-note-box {
          background: #f5f5f5;
          border-left: 3px solid #555;
          padding: 10px 14px;
          font-size: 13px;
        }
        .print-note-box-warning {
          border-left-color: #c0392b;
          background: #fdf2f2;
        }
        .print-image-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .print-image-wrapper {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .print-image {
          width: 100%;
          height: auto;
          border: 1px solid #ddd;
        }
        .print-image-caption {
          font-size: 11px;
          color: #666;
          margin: 4px 0 0 0;
          text-align: center;
        }
        .print-footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ccc;
          font-size: 11px;
          color: #666;
          text-align: center;
        }
        .print-footer-ref {
          margin: 4px 0;
        }
        .print-footer-disclaimer {
          font-style: italic;
          margin: 4px 0 0 0;
        }
        @media print {
          .print-image-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .print-section {
            page-break-inside: avoid;
          }
          .print-header, .print-section, .print-footer {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  )
}

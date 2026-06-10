"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  Eye,
  Edit3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/reports/StatusBadge";
import { CommentSection } from "@/components/reports/CommentSection";
import { Map } from "@/components/shared/Map";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorState } from "@/components/shared/ErrorState";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusUpdateForm } from "@/components/admin/StatusUpdateForm";
import { api } from "@/lib/api";
import type { Report } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { toast } from "sonner";

export default function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchReport = () => {
    setLoading(true);
    api.admin
      .listReports({ page: 1, limit: 100 })
      .then((data) => {
        const list = Array.isArray(data.reports) ? data.reports : [];
        const found = list.find((r) => r.report_id === Number(id));
        if (found) setReport(found);
        else setError("Report not found");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleStatusUpdate = () => {
    toast.success("Status updated successfully");
    fetchReport();
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.reports.delete(Number(id));
      toast.success("Report deleted");
      router.push("/admin/reports");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete report";
      toast.error(msg);
    }
    setDeleting(false);
    setDeleteOpen(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchReport} />;
  if (!report) return <ErrorState message="Report not found" />;

  const photoUrl = report.photo_urls?.[0]
    ? `/uploads/${report.photo_urls[0]}`
    : null;

  return (
    <div>
      <Button variant="ghost" asChild className="mb-6 rounded-full">
        <Link href="/admin/reports">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Reports
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {photoUrl && (
            <div className="rounded-2xl overflow-hidden border border-border/50">
              <img
                src={photoUrl}
                alt={report.title}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={report.status} />
              <span className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[report.category]}
              </span>
              <span className="text-xs font-mono text-muted-foreground ml-auto">
                #{report.report_id}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-heading">{report.title}</h1>
            {report.admin_notes && (
              <div className="mt-4 rounded-xl bg-muted/30 p-4 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Admin Notes
                </p>
                <p className="text-sm">{report.admin_notes}</p>
              </div>
            )}
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {report.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> User #{report.user_id}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {report.latitude.toFixed(4)},{" "}
              {report.longitude.toFixed(4)}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />{" "}
              {new Date(report.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4" /> {report.upvote_count}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {report.view_count}
            </span>
          </div>

          <Separator />
          <CommentSection reportId={report.report_id} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-2xl border-border/50 overflow-hidden h-64">
            <Map
              points={[
                {
                  lat: report.latitude,
                  lng: report.longitude,
                  title: report.title,
                },
              ]}
              className="h-full w-full"
            />
          </Card>
          {report.address && (
            <p className="text-xs text-muted-foreground">{report.address}</p>
          )}

          <StatusUpdateForm
            reportId={report.report_id}
            currentStatus={report.status}
            onSuccess={handleStatusUpdate}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-full flex-1"
            >
              <Link href={`/admin/reports/${report.report_id}/edit`}>
                <Edit3 className="mr-1.5 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="rounded-full flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Report?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This report will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-full"
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="rounded-full bg-destructive hover:bg-destructive/90"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
import { Send, MessageSquare, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import type { Comment } from "@/lib/types"
import { useAuth } from "@/contexts/AuthContext"

export function CommentSection({ reportId }: { reportId: number }) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.reports.getComments(reportId).then((data) => setComments(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoading(false))
  }, [reportId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const comment = await api.reports.addComment(reportId, content.trim())
      setComments((prev) => [...prev, comment])
      setContent("")
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comments ({comments.length})
      </h3>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first to share your thoughts.</p>
        ) : (
          comments.map((c) => (
            <div key={c.comment_id} className="flex gap-3 rounded-xl bg-muted/20 p-3 border border-border/30">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {c.author_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.author_name}</span>
                  {c.is_official_response && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">
                      <ShieldCheck className="h-3 w-3" /> Official
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{c.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isAuthenticated && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[44px] rounded-xl resize-none"
            rows={1}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

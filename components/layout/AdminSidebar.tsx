"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Leaf, LayoutDashboard, FileText, ScrollText, Users, ArrowLeft, LogOut, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/system-report", label: "System Report", icon: BarChart3 },
  { href: "/admin/reports", label: "Users Reports", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border/40">
        <Leaf className="h-6 w-6 text-accent" />
        <span className="font-heading text-lg font-bold">Ecosystem</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider bg-accent/20 text-accent px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border/40 space-y-1">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-3 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground" asChild>
          <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to App</Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 rounded-xl text-sidebar-foreground/70 hover:text-destructive"
          onClick={() => { logout(); router.push("/") }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </aside>
  )
}

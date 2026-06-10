"use client"

import { usePathname } from "next/navigation"
import { Leaf } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const pathname = usePathname()
  if (pathname.startsWith("/admin")) return null

  return (
    <footer className="border-t border-border/40 bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-heading text-lg font-bold text-primary mb-3">
              <Leaf className="h-5 w-5 text-accent" />
              <span>Ecosystem</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering citizens to report and track environmental issues in their communities.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/reports/public" className="text-muted-foreground hover:text-primary transition-colors">Public Reports</Link></li>
              <li><Link href="/register" className="text-muted-foreground hover:text-primary transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="text-muted-foreground hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-muted-foreground">Illegal Dumping</span></li>
              <li><span className="text-muted-foreground">Water Contamination</span></li>
              <li><span className="text-muted-foreground">Deforestation</span></li>
              <li><span className="text-muted-foreground">Air Pollution</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Ecosystem. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  Menu,
  Plus,
  LayoutDashboard,
  User,
  Bell,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() ||
      "U"
    : "?";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/reports/public", label: "Public Reports" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-primary"
        >
          <Leaf className="h-6 w-6 text-accent" />
          <span>Ecosystem</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link href="/reports/create">
                  <Plus className="mr-1 h-4 w-4" /> New Report
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full h-9 px-2 gap-2 ring-2 ring-primary/20 hover:ring-primary/40 bg-background border border-border text-sm font-medium cursor-pointer">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {initials}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => router.push("/dashboard")}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => router.push("/profile")}
                  >
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg"
                    onClick={() => router.push("/notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" /> Notifications
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer rounded-lg text-accent"
                        onClick={() => router.push("/admin")}
                      >
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer rounded-lg text-destructive"
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-full"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="rounded-full bg-primary hover:bg-primary/90"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-full h-8 w-8 bg-background border border-border hover:bg-muted cursor-pointer">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] rounded-l-2xl">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`text-lg font-medium transition-colors ${
                      pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2" />
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/dashboard");
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-left"
                    >
                      <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/reports/create");
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-left"
                    >
                      <Plus className="h-5 w-5" /> New Report
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/profile");
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-left"
                    >
                      <User className="h-5 w-5" /> Profile
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/notifications");
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-left"
                    >
                      <Bell className="h-5 w-5" /> Notifications
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setOpen(false);
                          router.push("/admin");
                        }}
                        className="flex items-center gap-2 text-lg font-medium text-left text-accent"
                      >
                        <Shield className="h-5 w-5" /> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                        router.push("/");
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-destructive text-left"
                    >
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/login");
                      }}
                      className="text-lg font-medium text-left"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/register");
                      }}
                      className="text-lg font-medium text-left text-primary"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

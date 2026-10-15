"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, HeartHandshake, History, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/user-provider";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/activity-log", label: "Log Aktivitas", icon: History },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  // Tutup menu dengan tombol Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    qc.clear();
    useUiStore.getState().resetFilters();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="app-bg">
      {/* Overlay: klik di luar menu untuk menutup.
          Sengaja di luar <header> karena backdrop-filter membuat elemen fixed di dalamnya ikut terkurung. */}
      {open && <div className="fixed inset-0 z-30 md:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <header className="glass sticky top-0 z-40 rounded-none border-x-0 border-t-0">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-blue-700">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/40">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span>Dana Sosial SOT B</span>
          </Link>

          {/* DESKTOP: menu inline */}
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-600 hover:bg-white/70 hover:text-blue-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP: info user + logout */}
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <div className="text-right leading-tight">
              <p className="text-base font-semibold text-slate-800">{user.name}</p>
              <Badge variant="secondary" className="mt-0.5 bg-blue-100 text-sm text-blue-700">
                {user.role === "ADMIN" ? "Admin" : "Donatur"}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Keluar">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* MOBILE: tombol burger */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* MOBILE: panel menu */}
        {open && (
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full animate-in fade-in slide-in-from-top-2 border-b border-white/60 bg-white/90 shadow-lg shadow-blue-900/10 backdrop-blur-xl md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 p-3">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 border-t border-slate-200/70 px-4 py-3">
              <div className="min-w-0 leading-tight flex gap-1">
                <p className="truncate text-base font-semibold text-slate-800">{user.name}</p>
                <Badge variant="secondary" className="mt-0.5 bg-blue-100 text-sm font-medium text-blue-700">
                  {user.role === "ADMIN" ? "Admin" : "Donatur"}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout} className="shrink-0">
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">{children}</main>
    </div>
  );
}
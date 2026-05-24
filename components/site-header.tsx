"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Trophy } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/standings", label: "Standings" },
  { href: "/bracket", label: "Bracket" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/68 backdrop-blur-2xl">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[linear-gradient(135deg,#4adeb6,#28b8ff)] text-slate-950 shadow-[0_14px_40px_rgba(40,184,255,0.28)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="font-[family:var(--font-display)] text-2xl uppercase tracking-[0.08em] text-white">CupCast</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/48">World Cup Analytics Lab</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/6 p-1 md:flex">
            {navItems.map((item) => {
              const active = item.href === "/bracket" ? pathname === "/bracket" || pathname === "/predictions" : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium text-white/68 transition",
                    active
                      ? "bg-[linear-gradient(135deg,#4adeb6,#28b8ff)] text-slate-950 shadow-[0_8px_24px_rgba(40,184,255,0.24)]"
                      : "hover:bg-white/8 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-300/16 bg-emerald-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100 lg:flex">
            <Activity className="h-3.5 w-3.5" />
            2026 Forecast
          </div>
        </div>

        <div className="mt-4 overflow-x-auto md:hidden">
          <nav className="flex min-w-max items-center gap-2 rounded-full border border-white/8 bg-white/6 p-1">
            {navItems.map((item) => {
              const active = item.href === "/bracket" ? pathname === "/bracket" || pathname === "/predictions" : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium text-white/68 transition",
                    active
                      ? "bg-[linear-gradient(135deg,#4adeb6,#28b8ff)] text-slate-950 shadow-[0_8px_24px_rgba(40,184,255,0.24)]"
                      : "hover:bg-white/8 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

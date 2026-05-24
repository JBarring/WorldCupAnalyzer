import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function NotFound() {
  return (
    <PageShell className="pt-16">
      <GlassPanel className="mx-auto max-w-2xl p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">404</p>
        <h1 className="mt-4 font-[family:var(--font-display)] text-5xl uppercase tracking-[0.04em] text-white">Match Center Missing</h1>
        <p className="mt-4 text-sm leading-7 text-white/62">
          That route does not exist in the current tournament shell. Jump back into the dashboard or the main match slate.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#4adeb6,#28b8ff)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_12px_40px_rgba(40,184,255,0.35)] transition hover:scale-[1.02]"
          >
            Go Home
          </Link>
          <Link href="/matches" className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12">
            Browse Matches
          </Link>
        </div>
      </GlassPanel>
    </PageShell>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 max-w-[1440px] px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-white/8 bg-white/5 px-6 py-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-[family:var(--font-display)] text-2xl uppercase tracking-[0.06em] text-white">Built for Phase 1 Velocity</p>
            <p className="max-w-2xl text-sm leading-7 text-white/62">
              JSON-backed MVP today, repository-style service boundaries for Prisma and live sports APIs later.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Next.js 15 • Recharts • Framer Motion • Zustand</p>
        </div>
      </div>
    </footer>
  );
}

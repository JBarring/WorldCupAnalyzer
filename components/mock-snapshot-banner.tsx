import { FlaskConical } from "lucide-react";

export function MockSnapshotBanner() {
  return (
    <div className="border-b border-amber-300/12 bg-[linear-gradient(90deg,rgba(245,158,11,0.14),rgba(251,191,36,0.08),rgba(40,184,255,0.1))]">
      <div className="mx-auto flex max-w-[1440px] items-start gap-3 px-4 py-3 text-sm text-amber-50/88 sm:px-6 lg:px-8">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
        <p className="leading-6">
          <span className="font-semibold text-amber-100">Official snapshot, simulated forecast:</span> the 48 teams and 2026 schedule are now based on a pulled tournament snapshot, but tables, win odds, and bracket outcomes remain model projections until kickoff on June 11, 2026.
        </p>
      </div>
    </div>
  );
}

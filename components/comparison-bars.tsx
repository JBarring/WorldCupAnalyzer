import { GlassPanel } from "@/components/ui/glass-panel";
import type { ComparisonStat } from "@/types";

interface ComparisonBarsProps {
  stats: ComparisonStat[];
}

export function ComparisonBars({ stats }: ComparisonBarsProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Team Comparison</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Stat Battle</p>
      </div>
      <div className="space-y-4">
        {stats.map((stat) => {
          const total = stat.homeValue + stat.awayValue || 1;
          const homeWidth = (stat.homeValue / total) * 100;
          const awayWidth = (stat.awayValue / total) * 100;

          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-semibold text-white">
                  {stat.homeValue}
                  {stat.suffix ?? ""}
                </span>
                <span className="text-white/54">{stat.label}</span>
                <span className="font-semibold text-white">
                  {stat.awayValue}
                  {stat.suffix ?? ""}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#4adeb6,#28b8ff)]" style={{ width: `${homeWidth}%` }} />
                </div>
                <div className="h-2 w-2 rounded-full bg-white/24" />
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="ml-auto h-full rounded-full bg-[linear-gradient(90deg,#ffbe55,#ff627d)]" style={{ width: `${awayWidth}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

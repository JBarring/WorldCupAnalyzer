import type { LucideIcon } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";

interface StatsCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function StatsCard({ label, value, description, icon: Icon }: StatsCardProps) {
  return (
    <GlassPanel className="h-full p-5 transition duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-white/8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/46">{label}</p>
          <div className="space-y-2">
            <p className="font-[family:var(--font-display)] text-4xl uppercase tracking-[0.03em] text-white">{value}</p>
            <p className="max-w-[22ch] text-sm leading-6 text-white/60">{description}</p>
          </div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/8 text-emerald-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassPanel>
  );
}

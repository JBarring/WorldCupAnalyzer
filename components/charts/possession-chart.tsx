"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { GlassPanel } from "@/components/ui/glass-panel";

interface PossessionChartProps {
  home: number;
  away: number;
}

export function PossessionChart({ home, away }: PossessionChartProps) {
  const data = [
    { name: "Home", value: home, color: "#4adeb6" },
    { name: "Away", value: away, color: "#ff627d" },
  ];

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Ball Control</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Possession Split</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={4}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(8, 14, 28, 0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                color: "white",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-white/66">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/40">Home</span>
          <span className="font-[family:var(--font-display)] text-2xl text-white">{home}%</span>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-white/66">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/40">Away</span>
          <span className="font-[family:var(--font-display)] text-2xl text-white">{away}%</span>
        </div>
      </div>
    </GlassPanel>
  );
}

"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { HydratedMatch } from "@/types";

interface MomentumChartProps {
  match: HydratedMatch;
}

export function MomentumChart({ match }: MomentumChartProps) {
  const data = match.momentum.map((point) => ({
    minute: `${point.minute}'`,
    home: Number((point.home * 100).toFixed(0)),
    away: Number((point.away * 100).toFixed(0)),
  }));

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Momentum Flow</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Territory Swings</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="homeMomentum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4adeb6" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#4adeb6" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="awayMomentum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff627d" stopOpacity={0.82} />
                <stop offset="100%" stopColor="#ff627d" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="minute" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} width={34} />
            <Tooltip
              contentStyle={{
                background: "rgba(8, 14, 28, 0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                color: "white",
              }}
            />
            <Area type="monotone" dataKey="home" stroke="#4adeb6" fill="url(#homeMomentum)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="away" stroke="#ff627d" fill="url(#awayMomentum)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}

"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { GlassPanel } from "@/components/ui/glass-panel";

interface ProbabilityAreaChartProps {
  data: Array<{ minute: number; home: number; draw: number; away: number }>;
}

export function ProbabilityAreaChart({ data }: ProbabilityAreaChartProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Projected Probability Curve</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Win Odds</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="probHome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#28b8ff" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#28b8ff" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="probDraw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffbe55" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ffbe55" stopOpacity={0.08} />
              </linearGradient>
              <linearGradient id="probAway" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff627d" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ff627d" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="minute" tickFormatter={(value) => `${value}'`} stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} width={34} />
            <Tooltip
              contentStyle={{
                background: "rgba(8, 14, 28, 0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                color: "white",
              }}
            />
            <Area type="monotone" dataKey="home" stroke="#28b8ff" fill="url(#probHome)" strokeWidth={2.3} />
            <Area type="monotone" dataKey="draw" stroke="#ffbe55" fill="url(#probDraw)" strokeWidth={2.3} />
            <Area type="monotone" dataKey="away" stroke="#ff627d" fill="url(#probAway)" strokeWidth={2.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}

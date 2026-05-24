"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { GlassPanel } from "@/components/ui/glass-panel";

interface PowerRankingsChartProps {
  data: Array<{
    name: string;
    powerRating: number;
    tournamentWinPct: number;
  }>;
}

export function PowerRankingsChart({ data }: PowerRankingsChartProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Power Rankings</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Title Contenders</p>
      </div>
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" axisLine={false} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{
                background: "rgba(8, 14, 28, 0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                color: "white",
              }}
            />
            <Bar dataKey="powerRating" radius={[0, 18, 18, 0]}>
              {data.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={index < 3 ? "#4adeb6" : index < 6 ? "#28b8ff" : "#ffbe55"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}

"use client";

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RecentTeamResult, Team } from "@/types";

interface TeamResultsChartProps {
  team: Team;
  results: RecentTeamResult[];
  teamMap: Map<string, Team>;
}

export function TeamResultsChart({ team, results, teamMap }: TeamResultsChartProps) {
  const data = [...results]
    .reverse()
    .map((result, index) => {
      const opponent = teamMap.get(result.opponentTeamId);
      const goalDifference = result.goalsFor - result.goalsAgainst;

      return {
        index: index + 1,
        opponent: opponent?.code ?? result.opponentTeamId,
        goalDifference,
        score: `${result.goalsFor}-${result.goalsAgainst}`,
        result: result.result,
      };
    });

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Recent Form Proxy</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">{team.code} Last 10</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="opponent" stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} width={34} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.18)" />
            <Tooltip
              formatter={(value: number) => [`${value > 0 ? "+" : ""}${value} goal diff`, "Margin"]}
              labelFormatter={(label, payload) => {
                const entry = payload?.[0]?.payload as { score: string; result: string } | undefined;
                return `${label} • ${entry?.score ?? ""} • ${entry?.result ?? ""}`;
              }}
              contentStyle={{
                background: "rgba(8, 14, 28, 0.96)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                color: "white",
              }}
            />
            <Bar dataKey="goalDifference" radius={[8, 8, 8, 8]}>
              <LabelList dataKey="score" position="top" fill="rgba(255,255,255,0.82)" fontSize={11} />
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.opponent}-${index}`}
                  fill={entry.result === "W" ? "#4adeb6" : entry.result === "D" ? "#ffbe55" : "#ff627d"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}

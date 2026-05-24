"use client";

import { SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { SimulationWeights } from "@/types";

interface ForecastControlsProps {
  iterations: number;
  modelSettings: SimulationWeights;
  overrideCount: number;
  isPending: boolean;
  onSetIterations: (iterations: number) => void;
  onWeightChange: (field: keyof SimulationWeights, value: number) => void;
  onResetWeights: () => void;
  onClearOverrides: () => void;
  onRun: () => void;
}

const weightFields: Array<{
  field: keyof SimulationWeights;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { field: "elo", label: "Elo weight", min: 0.15, max: 0.9, step: 0.01 },
  { field: "ranking", label: "Rank weight", min: 0, max: 0.5, step: 0.01 },
  { field: "form", label: "Form weight", min: 0, max: 0.4, step: 0.01 },
  { field: "goalDifferential", label: "Goal diff weight", min: 0, max: 0.3, step: 0.01 },
  { field: "neutralSiteFactor", label: "Neutral-site compression", min: 0.75, max: 1, step: 0.01 },
];

export function ForecastControls({
  iterations,
  modelSettings,
  overrideCount,
  isPending,
  onSetIterations,
  onWeightChange,
  onResetWeights,
  onClearOverrides,
  onRun,
}: ForecastControlsProps) {
  return (
    <GlassPanel className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/44">
            <SlidersHorizontal className="h-4 w-4 text-emerald-200" />
            Prediction Controls
          </div>
          <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Tune the model, then call your shot</p>
          <p className="max-w-3xl text-sm leading-7 text-white/62">
            Adjust how much the model leans on Elo, ranking, form, and goal margin. Weight changes apply on rerun, while locked knockout upsets update the downstream tree immediately and stay in place until you clear them.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {[2000, 3500, 5000].map((count) => (
            <Button key={count} variant={iterations === count ? "primary" : "secondary"} onClick={() => onSetIterations(count)}>
              {count.toLocaleString()} sims
            </Button>
          ))}
          <Button onClick={onRun} disabled={isPending}>
            <Sparkles className="h-4 w-4" />
            {isPending ? "Recomputing..." : "Rerun Forecast"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        {weightFields.map(({ field, label, min, max, step }) => (
          <div key={field} className="rounded-[22px] border border-white/8 bg-white/4 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">{label}</p>
              <span className="text-sm font-semibold text-white">{modelSettings[field].toFixed(2)}</span>
            </div>
            <input
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-[#4adeb6]"
              type="range"
              min={min}
              max={max}
              step={step}
              value={modelSettings[field]}
              onChange={(event) => onWeightChange(field, Number(event.target.value))}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/62">
        <p>{overrideCount} upset lock{overrideCount === 1 ? "" : "s"} currently active.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onResetWeights}>
            Reset Weights
          </Button>
          <Button variant="secondary" onClick={onClearOverrides} disabled={!overrideCount}>
            Clear Upsets
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}

"use client";

import { CalendarDays, ShieldAlert, Sparkles, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamCrest } from "@/components/team-crest";
import { cn } from "@/lib/utils/cn";
import type { GroupMatchOutcome, MatchPredictionBreakdown, Team } from "@/types";

interface FixtureStoryPanelProps {
  fixtureId: string;
  mode: "group" | "knockout";
  title: string;
  subtitle: string;
  homeTeam: Team;
  awayTeam: Team;
  homeProbability: number;
  awayProbability: number;
  drawProbability?: number;
  explanation: MatchPredictionBreakdown;
  kickoff?: string;
  venue?: string;
  city?: string;
  overrideWinnerId?: string;
  onOverride?: (fixtureId: string, winnerTeamId?: string) => void;
  groupOverrideOutcome?: GroupMatchOutcome;
  onGroupOverride?: (fixtureId: string, outcome?: GroupMatchOutcome) => void;
}

function getFactorEdgeForTeam(explanation: MatchPredictionBreakdown, teamId: string, homeTeamId: string) {
  return explanation.factors.map((factor) => ({
    ...factor,
    edge: teamId === homeTeamId ? factor.homeEdge : factor.awayEdge,
  }));
}

export function FixtureStoryPanel({
  fixtureId,
  mode,
  title,
  subtitle,
  homeTeam,
  awayTeam,
  homeProbability,
  awayProbability,
  drawProbability,
  explanation,
  kickoff,
  venue,
  city,
  overrideWinnerId,
  onOverride,
  groupOverrideOutcome,
  onGroupOverride,
}: FixtureStoryPanelProps) {
  const isGroupMode = mode === "group";
  const favoriteTeam = explanation.favoriteTeamId === homeTeam.id ? homeTeam : awayTeam;
  const underdogTeam = favoriteTeam.id === homeTeam.id ? awayTeam : homeTeam;
  const overrideWinner = overrideWinnerId === homeTeam.id ? homeTeam : overrideWinnerId === awayTeam.id ? awayTeam : null;
  const modelGroupOutcome: GroupMatchOutcome | null = isGroupMode
    ? explanation.projectedOutcome ??
      (typeof drawProbability === "number" && drawProbability >= homeProbability && drawProbability >= awayProbability
        ? "DRAW"
        : homeProbability >= awayProbability
          ? "HOME"
          : "AWAY")
    : null;
  const factorEdges = getFactorEdgeForTeam(explanation, favoriteTeam.id, homeTeam.id)
    .filter((factor) => factor.edge > 0)
    .sort((left, right) => right.edge - left.edge)
    .slice(0, 2);
  const isUpsetLocked = Boolean(overrideWinner && overrideWinner.id !== favoriteTeam.id);
  const currentGroupOutcome = isGroupMode ? groupOverrideOutcome ?? modelGroupOutcome : null;
  const currentKnockoutWinnerId = overrideWinner?.id ?? favoriteTeam.id;
  const breakdownMagnitude = explanation.factors.reduce(
    (total, factor) => total + Math.max(Math.abs(factor.homeEdge), Math.abs(factor.awayEdge)),
    0,
  );
  const projectedResultTeam = isGroupMode
    ? modelGroupOutcome === "HOME"
      ? homeTeam
      : modelGroupOutcome === "AWAY"
        ? awayTeam
        : null
    : favoriteTeam;
  const projectedResultLabel = isGroupMode && modelGroupOutcome === "DRAW" ? "Projected result" : "Projected winner";
  const narrative =
    isGroupMode && modelGroupOutcome === "DRAW"
      ? `${favoriteTeam.name} still carry the stronger underlying rating edge by ${Math.abs(explanation.ratingGap).toFixed(1)} blended points, but the rounded match projection lands at ${explanation.projectedScoreline}, so the current result call is a draw.`
      : `${favoriteTeam.name} carry the model edge by ${Math.abs(explanation.ratingGap).toFixed(1)} blended rating points. ${
          factorEdges[0] ? `${factorEdges[0].label} is doing the most work` : "The baseline rating gap is decisive"
        }${factorEdges[1] ? `, with ${factorEdges[1].label.toLowerCase()} next in line.` : "."} The most likely scoreline is ${explanation.projectedScoreline}, while upset risk sits at ${explanation.upsetRisk.toFixed(1)}%.`;
  const userDeviationLabel =
    isGroupMode
      ? groupOverrideOutcome === "DRAW"
        ? "User draw call"
        : groupOverrideOutcome === "HOME"
          ? homeTeam.code
          : groupOverrideOutcome === "AWAY"
            ? awayTeam.code
            : null
      : overrideWinner?.code ?? null;
  const isUserUpset =
    isGroupMode
      ? Boolean(groupOverrideOutcome) &&
        modelGroupOutcome !== "DRAW" &&
        groupOverrideOutcome !== "DRAW" &&
        groupOverrideOutcome !== modelGroupOutcome
      : isUpsetLocked;
  const hasUserOverride = isGroupMode
    ? Boolean(groupOverrideOutcome && modelGroupOutcome && groupOverrideOutcome !== modelGroupOutcome)
    : isUpsetLocked;
  const groupPickOptions = modelGroupOutcome === "HOME"
      ? [
          { outcome: "HOME" as const, label: `${homeTeam.code} model pick` },
          { outcome: "DRAW" as const, label: "Draw" },
          { outcome: "AWAY" as const, label: `${awayTeam.code} upset pick` },
        ]
      : modelGroupOutcome === "AWAY"
        ? [
            { outcome: "AWAY" as const, label: `${awayTeam.code} model pick` },
            { outcome: "DRAW" as const, label: "Draw" },
            { outcome: "HOME" as const, label: `${homeTeam.code} upset pick` },
          ]
        : [
            { outcome: "DRAW" as const, label: "Draw model pick" },
            { outcome: "HOME" as const, label: `${homeTeam.code} pick` },
            { outcome: "AWAY" as const, label: `${awayTeam.code} pick` },
          ];

  const probabilityStops = [
    { label: homeTeam.code, value: homeProbability, tone: "from-emerald-300/90 to-cyan-400/90" },
    ...(typeof drawProbability === "number" ? [{ label: "Draw", value: drawProbability, tone: "from-white/35 to-white/15" }] : []),
    { label: awayTeam.code, value: awayProbability, tone: "from-sky-400/85 to-indigo-400/85" },
  ];

  return (
    <GlassPanel className="overflow-hidden border border-[#243154] bg-[#0f1420]/96 p-0">
      <div className="border-b border-white/8 px-5 py-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
          <Sparkles className="h-4 w-4 text-emerald-200" />
          Matchup Focus
        </div>
        <p className="mt-2 font-[family:var(--font-display)] text-[2rem] uppercase tracking-[0.04em] text-white">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/56">{subtitle}</p>
        <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/34">
          <CalendarDays className="h-4 w-4 text-emerald-200" />
          {kickoff ?? "Kickoff pending"} • {venue ?? "Neutral venue"}{city ? ` • ${city}` : ""}
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
        <div className="flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
          <span>Predicted details</span>
          {hasUserOverride ? (
            <span className="rounded-full border border-amber-300/18 bg-amber-300/10 px-3 py-1 text-amber-100">
              {isUserUpset ? "User upset" : "User pick"}
            </span>
          ) : null}
        </div>

        <div className={cn("grid gap-3", isGroupMode ? "sm:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)]" : "sm:grid-cols-2")}>
          {(isGroupMode
            ? [
                {
                  label: homeTeam.code,
                  value: homeProbability,
                  tone: modelGroupOutcome === "HOME" ? "border-[#243154] bg-white/[0.08]" : "border-[#243154] bg-[#101623]",
                  detail: modelGroupOutcome === "HOME" ? "Model pick" : "Home win",
                  team: homeTeam,
                },
                {
                  label: "Draw",
                  value: drawProbability,
                  tone: modelGroupOutcome === "DRAW" ? "border-[#243154] bg-white/[0.08]" : "border-[#243154] bg-[#101623]",
                  detail: modelGroupOutcome === "DRAW" ? "Model pick" : "Shared points",
                },
                {
                  label: awayTeam.code,
                  value: awayProbability,
                  tone: modelGroupOutcome === "AWAY" ? "border-[#243154] bg-white/[0.08]" : "border-[#243154] bg-[#101623]",
                  detail: modelGroupOutcome === "AWAY" ? "Model pick" : "Away win",
                  team: awayTeam,
                },
              ]
            : [
                {
                  label: homeTeam.code,
                  value: homeProbability,
                  tone: explanation.favoriteTeamId === homeTeam.id ? "border-[#243154] bg-white/[0.08]" : "border-[#243154] bg-[#101623]",
                  detail: explanation.favoriteTeamId === homeTeam.id ? "Model pick" : "Challenger",
                  team: homeTeam,
                },
                {
                  label: awayTeam.code,
                  value: awayProbability,
                  tone: explanation.favoriteTeamId === awayTeam.id ? "border-[#243154] bg-white/[0.08]" : "border-[#243154] bg-[#101623]",
                  detail: explanation.favoriteTeamId === awayTeam.id ? "Model pick" : "Challenger",
                  team: awayTeam,
                },
              ]
          ).map((entry) => (
            <div key={entry.label} className={cn("rounded-[18px] border px-4 py-4", entry.tone)}>
              <div className={cn("flex items-center gap-3", entry.team ? "" : "justify-center text-center")}>
                {entry.team ? <TeamCrest team={entry.team} size="sm" showFlag /> : null}
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{entry.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/34">{entry.detail}</p>
                </div>
              </div>
              <p className="mt-4 font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">
                {typeof entry.value === "number" ? `${entry.value.toFixed(1)}%` : "--"}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-center">
          <p className="text-[1.05rem] font-semibold text-white/72">
            Projected: <span className="text-white">{explanation.projectedScoreline}</span>
          </p>
          <p className="text-sm leading-7 text-white/58">
            {projectedResultLabel}:{" "}
            <span className="font-semibold text-white">{projectedResultTeam ? projectedResultTeam.name : "Draw"}</span>
          </p>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/60">{narrative}</p>
          {hasUserOverride ? (
            <p className="mx-auto max-w-2xl text-sm leading-7 text-amber-100">
              {isUserUpset
                ? `User upset: ${userDeviationLabel}. The live group table and knockout path are already following your call instead of the model.`
                : `User pick: ${userDeviationLabel}. The live group table and knockout path are already following your call instead of the model.`}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="h-3 overflow-hidden rounded-full bg-white/8">
            <div className="flex h-full">
              {probabilityStops.map((stop) => (
                <div
                  key={stop.label}
                  className={`h-full bg-gradient-to-r ${stop.tone}`}
                  style={{ width: `${stop.value}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.18em] text-white/42">
            {probabilityStops.map((stop) => (
              <span key={stop.label}>
                {stop.label} {stop.value.toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 px-5 py-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
          <Target className="h-4 w-4 text-emerald-200" />
          Your Pick
        </div>

        {mode === "knockout" ? (
          <p className="mt-4 text-sm leading-7 text-white/62">
            Choose the model pick or the alternate team below. Selecting the model pick returns this match to the default simulation path automatically.
          </p>
        ) : (
          <p className="mt-4 text-sm leading-7 text-white/62">
            Choose the model pick, a draw, or the alternate team below. Selecting the model pick returns this match to the default simulation path automatically.
          </p>
        )}

        {hasUserOverride ? (
          <p className="mt-3 text-sm leading-7 text-amber-100">
            {isUserUpset
              ? `Current live call: ${userDeviationLabel} upset pick. The remaining bracket is already following your selection.`
              : `Current live call: ${userDeviationLabel}. This fixture is now running on your selection instead of the default model line.`}
          </p>
        ) : null}

        {onOverride && mode === "knockout" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button
              variant={currentKnockoutWinnerId === favoriteTeam.id ? "primary" : "secondary"}
              className={cn(currentKnockoutWinnerId === favoriteTeam.id ? "shadow-none" : "", "px-4 py-2 text-xs uppercase tracking-[0.18em]")}
              onClick={() => onOverride(fixtureId, favoriteTeam.id)}
            >
              {favoriteTeam.code} model pick
            </Button>
            <Button
              variant={currentKnockoutWinnerId === underdogTeam.id ? "primary" : "secondary"}
              className={cn(currentKnockoutWinnerId === underdogTeam.id ? "shadow-none" : "", "px-4 py-2 text-xs uppercase tracking-[0.18em]")}
              onClick={() => onOverride(fixtureId, underdogTeam.id)}
            >
              {underdogTeam.code} upset pick
            </Button>
          </div>
        ) : onGroupOverride && mode === "group" ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {groupPickOptions.map(({ outcome, label }) => {
              const active = currentGroupOutcome === outcome;

              return (
                <Button
                  key={outcome}
                  variant={active ? "primary" : "secondary"}
                  className={cn(active ? "shadow-none" : "", "px-4 py-2 text-xs uppercase tracking-[0.18em]")}
                  onClick={() => onGroupOverride(fixtureId, outcome)}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/8 px-5 py-5">
        <div className="flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-white/36">
          <ShieldAlert className="h-4 w-4 text-emerald-200" />
          Step-By-Step Breakdown
        </div>
        {explanation.factors.map((factor, index) => {
          const favoredTeam = factor.homeEdge >= factor.awayEdge ? homeTeam : awayTeam;
          const favoredEdge = Math.max(factor.homeEdge, factor.awayEdge);
          const contributionShare = breakdownMagnitude > 0 ? (Math.abs(favoredEdge) / breakdownMagnitude) * 100 : 0;

          return (
            <div key={factor.label} className="mt-4 rounded-[18px] border border-[#243154] bg-[#12192a] px-4 py-4">
              <div className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 text-sm font-semibold text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#243154] bg-[#182033] text-[0.8rem] text-white/62">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[1rem]">{factor.label}</p>
                  <p className="mt-1 text-[0.68rem] uppercase tracking-[0.18em] text-white/34">
                    {contributionShare.toFixed(0)}% of weighted edge
                  </p>
                </div>
                <span className="text-[0.82rem] uppercase tracking-[0.16em] text-[#f3b742]">
                  {favoredTeam.code} {favoredEdge >= 0 ? `+${favoredEdge.toFixed(1)}` : favoredEdge.toFixed(1)}
                </span>
              </div>
              <div className="mt-3 grid gap-2 pl-[2.9rem] sm:grid-cols-2">
                <div className="rounded-[14px] border border-white/6 bg-white/[0.03] px-3 py-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/32">{homeTeam.code}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{factor.homeEdge >= 0 ? `+${factor.homeEdge.toFixed(1)}` : factor.homeEdge.toFixed(1)}</p>
                </div>
                <div className="rounded-[14px] border border-white/6 bg-white/[0.03] px-3 py-2">
                  <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/32">{awayTeam.code}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{factor.awayEdge >= 0 ? `+${factor.awayEdge.toFixed(1)}` : factor.awayEdge.toFixed(1)}</p>
                </div>
              </div>
              <p className="mt-3 pl-[2.9rem] text-sm leading-6 text-white/56">
                {factor.description} {favoredTeam.name} currently carry the edge in this lane, which is why this factor is leaning their way in the model.
              </p>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ShieldAlert, Sparkles, Target } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils/cn";
import { describeKnockoutSlot } from "@/lib/utils/tournament";
import type { BracketFixture, Team } from "@/types";

interface KnockoutDetailRailProps {
  fixture: BracketFixture;
  homeTeam: Team;
  awayTeam: Team;
  overrideWinnerId?: string;
  homeTitleOdds?: number;
  awayTitleOdds?: number;
  kickoffLabel: string;
  onOverride: (fixtureId: string, winnerTeamId?: string) => void;
}

export function KnockoutDetailRail({
  fixture,
  homeTeam,
  awayTeam,
  overrideWinnerId,
  homeTitleOdds,
  awayTitleOdds,
  kickoffLabel,
  onOverride,
}: KnockoutDetailRailProps) {
  const explanation = fixture.explanation;

  if (!explanation) {
    return null;
  }

  const favoriteTeam = explanation.favoriteTeamId === homeTeam.id ? homeTeam : awayTeam;
  const overrideWinner = overrideWinnerId === homeTeam.id ? homeTeam : overrideWinnerId === awayTeam.id ? awayTeam : null;
  const isUpsetLocked = Boolean(overrideWinner && overrideWinner.id !== favoriteTeam.id);
  const breakdownMagnitude = explanation.factors.reduce(
    (total, factor) => total + Math.max(Math.abs(factor.homeEdge), Math.abs(factor.awayEdge)),
    0,
  );

  return (
    <div className="xl:sticky xl:top-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={fixture.id}
          initial={{ opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -22 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <GlassPanel className="overflow-hidden border border-[#243154] bg-[#0f1420]/96 p-0">
            <div className="border-b border-white/8 px-5 py-5">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
                <Sparkles className="h-4 w-4 text-emerald-200" />
                Matchup Focus
              </div>
              <p className="mt-2 font-[family:var(--font-display)] text-[2rem] uppercase tracking-[0.04em] text-white">
                {homeTeam.code} vs {awayTeam.code}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/56">
                {fixture.roundLabel} • {fixture.venue ?? "Projected venue"} • {fixture.city ?? "TBD"}
              </p>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)] items-center gap-3">
                {[
                  {
                    team: homeTeam,
                    probability: fixture.homeWinProbability,
                    seedLabel: fixture.homeSeedLabel,
                    titleOdds: homeTitleOdds,
                  },
                  {
                    team: awayTeam,
                    probability: fixture.awayWinProbability,
                    seedLabel: fixture.awaySeedLabel,
                    titleOdds: awayTitleOdds,
                  },
                ].map(({ team, probability, seedLabel, titleOdds }) => {
                  const isFavorite = explanation.favoriteTeamId === team.id;
                  const isPicked = isUpsetLocked && overrideWinner?.id === team.id;

                  return (
                    <div
                      key={team.id}
                      className={cn(
                        "rounded-[18px] border px-4 py-4 text-center transition",
                        isPicked
                          ? "border-amber-300/26 bg-amber-300/10"
                          : isFavorite
                            ? "border-[#f0ad36]/40 bg-[#1b1918]"
                            : "border-[#243154] bg-[#101623]",
                      )}
                    >
                      <p className="truncate text-[1.1rem] font-semibold text-white">{team.shortName}</p>
                      <p className="mt-2 text-[0.72rem] uppercase tracking-[0.22em] text-white/28">{describeKnockoutSlot(seedLabel)}</p>
                      <p className={cn("mt-4 font-[family:var(--font-display)] text-[2.45rem] uppercase tracking-[0.03em]", isFavorite ? "text-emerald-300" : "text-white/70")}>
                        {probability.toFixed(0)}%
                      </p>
                      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-white/28">{titleOdds?.toFixed(1) ?? "0.0"}% title</p>
                    </div>
                  );
                }).flatMap((panel, index) => (index === 0 ? [panel, <div key="vs" className="text-center text-white/28">VS</div>] : [panel]))}
              </div>

              <div className="space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/34">
                  <CalendarDays className="h-4 w-4 text-emerald-200" />
                  {kickoffLabel}
                </div>
                <p className="text-[1.05rem] font-semibold text-white/72">
                  Projected: <span className="text-white">{homeTeam.code} {explanation.projectedScoreline} {awayTeam.code}</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full border border-[#f0ad36]/40 bg-[#f0ad36]/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#f3b742]">
                    Seed model
                  </span>
                  {isUpsetLocked ? (
                    <span className="rounded-full border border-amber-300/40 bg-amber-300/12 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-100">
                      Upset locked
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="border-t border-white/8 px-5 py-5">
              <div className="flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-[#b56ee5]">
                <Target className="h-4 w-4 text-emerald-200" />
                Upset Lock
              </div>
              <p className="mt-3 text-[1.05rem] leading-8 text-white/64">
                The bracket follows <span className="font-semibold text-white">{favoriteTeam.name}</span> by default. Only disagreeing with the model creates a lock, so use the buttons below when you want to force an upset and recalculate the remaining tree.
              </p>
              <p className="mt-2 text-sm text-white/40">
                Current upset risk: <span className="font-semibold text-white">{explanation.upsetRisk.toFixed(1)}%</span>. Picking the model favorite keeps the bracket on the model line.
              </p>
              {isUpsetLocked ? <p className="mt-2 text-sm text-white/40">Downstream fixtures are now carrying your upset path.</p> : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { team: homeTeam, active: isUpsetLocked && overrideWinnerId === homeTeam.id, seedLabel: fixture.homeSeedLabel },
                  { team: awayTeam, active: isUpsetLocked && overrideWinnerId === awayTeam.id, seedLabel: fixture.awaySeedLabel },
                ].map(({ team, active, seedLabel }) => {
                  const isFavorite = explanation.favoriteTeamId === team.id;

                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => onOverride(fixture.id, team.id)}
                      className={cn(
                        "rounded-[16px] border px-4 py-4 text-center transition",
                        active
                          ? "border-[#f0ad36] bg-[#241d17] text-[#f3b742]"
                          : isFavorite
                            ? "border-[#f0ad36]/28 bg-[#171b27] text-white hover:border-[#f0ad36]/48"
                            : "border-[#243154] bg-[#151b2a] text-white/86 hover:border-[#3b4d7a]",
                      )}
                    >
                      <p className="text-[0.74rem] uppercase tracking-[0.2em] text-white/30">{seedLabel}</p>
                      <p className="mt-2 text-[1.05rem] font-semibold">{team.name}</p>
                      <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-white/34">
                        {isFavorite ? "Model path" : "Force upset"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!isUpsetLocked}
                onClick={() => onOverride(fixture.id)}
                className="mt-3 text-sm text-white/32 underline-offset-4 transition hover:text-white/54 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear upset lock
              </button>
            </div>

            <div className="border-t border-white/8 px-5 py-5">
              <div className="flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.22em] text-white/36">
                <ShieldAlert className="h-4 w-4 text-emerald-200" />
                Step-By-Step Breakdown
              </div>
              <div className="mt-4 space-y-3">
                {explanation.factors.map((factor, index) => {
                  const leadingTeam = factor.homeEdge >= factor.awayEdge ? homeTeam : awayTeam;
                  const leadingEdge = Math.max(factor.homeEdge, factor.awayEdge);
                  const contributionShare = breakdownMagnitude > 0 ? (Math.abs(leadingEdge) / breakdownMagnitude) * 100 : 0;

                  return (
                    <div key={factor.label} className="rounded-[18px] border border-[#243154] bg-[#12192a] px-4 py-4">
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
                          {leadingTeam.code} {leadingEdge >= 0 ? `+${leadingEdge.toFixed(1)}` : leadingEdge.toFixed(1)}
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
                        {factor.description} {leadingTeam.name} currently carry the edge in this lane, which is why this factor is leaning their way in the model.
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

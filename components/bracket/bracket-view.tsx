"use client";

import { motion } from "framer-motion";

import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils/cn";
import type { BracketFixture, Team } from "@/types";

interface BracketViewProps {
  bracket: Record<string, BracketFixture[]>;
  teamMap: Map<string, Team>;
  selectedFixtureId?: string;
  onSelectFixture?: (fixtureId: string) => void;
}

const sideRoundOrder = ["ROUND_OF_32", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL"] as const;

const stageTitles = {
  ROUND_OF_32: "R32",
  ROUND_OF_16: "R16",
  QUARTERFINAL: "QF",
  SEMIFINAL: "SF",
  FINAL: "Final",
} as const;

const FIXTURE_CARD_HEIGHT = 118;
const BASE_ROUND_GAP = 12;

function getReferencedFixtureId(slot?: string) {
  const match = slot?.match(/^[WL](\d+)$/);
  return match ? `M${match[1]}` : null;
}

function collectAncestorIds(rootFixtureId: string, fixtureMap: Map<string, BracketFixture>, visited = new Set<string>()) {
  if (visited.has(rootFixtureId)) {
    return visited;
  }

  const fixture = fixtureMap.get(rootFixtureId);

  if (!fixture) {
    return visited;
  }

  visited.add(rootFixtureId);

  [fixture.homeSeedLabel, fixture.awaySeedLabel].forEach((slot) => {
    const parentFixtureId = getReferencedFixtureId(slot);

    if (parentFixtureId) {
      collectAncestorIds(parentFixtureId, fixtureMap, visited);
    }
  });

  return visited;
}

function formatSeedLabel(seedLabel?: string) {
  if (!seedLabel) return "--";

  if (/^3[A-L]+$/.test(seedLabel)) {
    return seedLabel.length > 5 ? `${seedLabel.slice(0, 5)}…` : seedLabel;
  }

  return seedLabel;
}

function buildRoundMetrics() {
  return sideRoundOrder.reduce<Record<(typeof sideRoundOrder)[number], { gap: number; offset: number }>>(
    (metrics, round, index) => {
      if (index === 0) {
        metrics[round] = { gap: BASE_ROUND_GAP, offset: 0 };
        return metrics;
      }

      const previousRound = sideRoundOrder[index - 1];
      const previous = metrics[previousRound];

      metrics[round] = {
        offset: previous.offset + (FIXTURE_CARD_HEIGHT + previous.gap) / 2,
        gap: FIXTURE_CARD_HEIGHT + previous.gap * 2,
      };

      return metrics;
    },
    {
      ROUND_OF_32: { gap: BASE_ROUND_GAP, offset: 0 },
      ROUND_OF_16: { gap: 0, offset: 0 },
      QUARTERFINAL: { gap: 0, offset: 0 },
      SEMIFINAL: { gap: 0, offset: 0 },
    },
  );
}

export function BracketView({ bracket, teamMap, selectedFixtureId, onSelectFixture }: BracketViewProps) {
  const finalFixture = bracket.FINAL?.[0];
  const fixtureMap = new Map(
    [...sideRoundOrder, "FINAL"].flatMap((round) => (bracket[round] ?? []).map((fixture) => [fixture.id, fixture] as const)),
  );
  const roundMetrics = buildRoundMetrics();

  const leftRootId = getReferencedFixtureId(finalFixture?.homeSeedLabel);
  const rightRootId = getReferencedFixtureId(finalFixture?.awaySeedLabel);
  const leftFixtureIds = leftRootId ? collectAncestorIds(leftRootId, fixtureMap) : new Set<string>();
  const rightFixtureIds = rightRootId ? collectAncestorIds(rightRootId, fixtureMap) : new Set<string>();

  const leftStages = sideRoundOrder.reduce<Record<(typeof sideRoundOrder)[number], BracketFixture[]>>((map, round) => {
    map[round] = (bracket[round] ?? []).filter((fixture) => leftFixtureIds.has(fixture.id));
    return map;
  }, { ROUND_OF_32: [], ROUND_OF_16: [], QUARTERFINAL: [], SEMIFINAL: [] });

  const rightStages = sideRoundOrder.reduce<Record<(typeof sideRoundOrder)[number], BracketFixture[]>>((map, round) => {
    map[round] = (bracket[round] ?? []).filter((fixture) => rightFixtureIds.has(fixture.id));
    return map;
  }, { ROUND_OF_32: [], ROUND_OF_16: [], QUARTERFINAL: [], SEMIFINAL: [] });

  const renderFixture = (fixture: BracketFixture, index: number, emphasis: "standard" | "final" = "standard") => {
    const homeTeam = teamMap.get(fixture.homeTeamId);
    const awayTeam = teamMap.get(fixture.awayTeamId);

    if (!homeTeam || !awayTeam) {
      return null;
    }

    const overrideWinnerId = fixture.overriddenWinnerTeamId;
    const favoriteTeamId = fixture.explanation?.favoriteTeamId;
    const hasUpsetPick = Boolean(overrideWinnerId && favoriteTeamId && overrideWinnerId !== favoriteTeamId);
    const isSelectedFixture = selectedFixtureId === fixture.id;
    const resolvedWinnerId = overrideWinnerId ?? fixture.winnerTeamId ?? favoriteTeamId ?? homeTeam.id;
    const resolvedWinnerProbability = resolvedWinnerId === homeTeam.id ? fixture.homeWinProbability : fixture.awayWinProbability;
    const probabilityTone = hasUpsetPick ? "from-amber-300 to-amber-500" : "from-emerald-300 to-amber-400";
    const focusTone = hasUpsetPick ? "bg-amber-300" : "bg-[#f0ad36]";

    const teamRows = [
      { team: homeTeam, seedLabel: fixture.homeSeedLabel },
      { team: awayTeam, seedLabel: fixture.awaySeedLabel },
    ];

    return (
      <motion.button
        key={fixture.id}
        type="button"
        onClick={() => onSelectFixture?.(fixture.id)}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: index * 0.03 }}
        className="w-full text-left"
      >
        <GlassPanel
          className={cn(
            emphasis === "final" ? "h-[7.75rem]" : "h-[7.35rem]",
            "relative overflow-hidden rounded-[20px] border border-[#243154] bg-[#101623]/95 p-0 transition duration-200",
            isSelectedFixture
              ? hasUpsetPick
                ? "border-amber-300/80 bg-[#19150f] shadow-[0_0_0_2px_rgba(252,211,77,0.28),0_14px_34px_rgba(252,211,77,0.16)]"
                : "border-[#f0ad36] bg-[#17130f] shadow-[0_0_0_2px_rgba(240,173,54,0.24),0_14px_34px_rgba(240,173,54,0.14)]"
              : hasUpsetPick
                ? "border-amber-300/42 bg-[#15120f] shadow-[0_10px_26px_rgba(252,211,77,0.09)]"
                : "border-[#2a3556]",
          )}
        >
          {(isSelectedFixture || hasUpsetPick) ? <div className={cn("absolute inset-x-0 top-0 h-1.5", focusTone)} /> : null}
          <div className="flex h-full flex-col">
            {teamRows.map(({ team, seedLabel }, rowIndex) => {
              const isResolvedWinner = resolvedWinnerId === team.id;
              const isManualWinner = overrideWinnerId === team.id;
              const isFavorite = favoriteTeamId === team.id;
              const rowTone = isManualWinner
                ? hasUpsetPick
                  ? "bg-amber-300/18 text-amber-50 shadow-[inset_0_0_0_1px_rgba(252,211,77,0.16)]"
                  : isResolvedWinner
                    ? "bg-white/[0.05] text-white"
                    : "bg-transparent text-white/84"
                : isResolvedWinner
                  ? "bg-white/[0.05] text-white"
                  : "bg-transparent text-white/84";

              return (
                <div
                  key={team.id}
                  className={cn(
                    "flex min-h-0 flex-1 items-center justify-between gap-2.5 px-3",
                    rowTone,
                    rowIndex === 0 ? "border-b border-white/6" : "",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="w-8 shrink-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-white/34">{formatSeedLabel(seedLabel)}</span>
                    <span className="truncate text-[1rem] font-semibold tracking-[0.01em]">{team.shortName}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-[0.66rem]">
                    {isManualWinner && hasUpsetPick ? (
                      <span
                        className="rounded-full bg-amber-300/16 px-1.5 py-0.5 font-semibold uppercase tracking-[0.16em] text-amber-100"
                      >
                        upset
                      </span>
                    ) : isResolvedWinner ? (
                      <span className={cn("text-base leading-none", isFavorite ? "text-emerald-300" : "text-white/72")}>✓</span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            <div className={cn("border-t border-white/6 px-3 py-1.5", isSelectedFixture ? "bg-[#111827]" : "bg-[#0b0f1a]")}>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1a2240]">
                  <div className={cn("h-full rounded-full bg-gradient-to-r", probabilityTone)} style={{ width: `${resolvedWinnerProbability}%` }} />
                </div>
                <span className="min-w-[2rem] text-right font-[family:var(--font-display)] text-[0.84rem] uppercase tracking-[0.02em] text-[#f3b742]">
                  {resolvedWinnerProbability.toFixed(0)}%
                </span>
                {hasUpsetPick ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.16em]",
                      "bg-amber-300/22 text-amber-100",
                    )}
                  >
                    Upset locked
                  </span>
                ) : (
                  <span className="text-[0.52rem] font-semibold uppercase tracking-[0.16em] text-white/34">{emphasis === "final" ? "title" : "advances"}</span>
                )}
              </div>
            </div>
          </div>
        </GlassPanel>
      </motion.button>
    );
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid min-w-[1530px] gap-3.5"
        style={{ gridTemplateColumns: "repeat(4, minmax(175px, 1fr)) minmax(190px, 1fr) repeat(4, minmax(175px, 1fr))" }}
      >
        {sideRoundOrder.map((round) => (
          <div key={`left-${round}`}>
            <div className="mb-3 flex items-center gap-2 px-1">
              <p className="text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-white/36">{stageTitles[round]}</p>
              <div className="h-px flex-1 bg-gradient-to-r from-[#f0ad36]/40 to-transparent" />
            </div>
            <div className="flex flex-col" style={{ gap: `${roundMetrics[round].gap}px`, paddingTop: `${roundMetrics[round].offset}px` }}>
              {leftStages[round].map((fixture, index) => renderFixture(fixture, index))}
            </div>
          </div>
        ))}

        <div>
          <div className="mb-3 flex items-center gap-2 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#f0ad36]/40" />
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-white/36">{stageTitles.FINAL}</p>
            <div className="h-px flex-1 bg-gradient-to-r from-[#f0ad36]/40 to-transparent" />
          </div>
          <div className="flex flex-col" style={{ paddingTop: `${roundMetrics.SEMIFINAL.offset}px` }}>
            {finalFixture ? renderFixture(finalFixture, 0, "final") : null}
          </div>
        </div>

        {[...sideRoundOrder].reverse().map((round) => (
          <div key={`right-${round}`}>
            <div className="mb-3 flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-[#f0ad36]/40 to-transparent" />
              <p className="text-right text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-white/36">{stageTitles[round]}</p>
            </div>
            <div className="flex flex-col" style={{ gap: `${roundMetrics[round].gap}px`, paddingTop: `${roundMetrics[round].offset}px` }}>
              {rightStages[round].map((fixture, index) => renderFixture(fixture, index))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

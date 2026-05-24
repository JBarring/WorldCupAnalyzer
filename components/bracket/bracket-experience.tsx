"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowRight, GitBranch, Sparkles, Trophy, Users } from "lucide-react";

import { BracketView } from "@/components/bracket/bracket-view";
import { FixtureStoryPanel } from "@/components/bracket/fixture-story-panel";
import { ForecastControls } from "@/components/forecast-controls";
import { GroupTable } from "@/components/group-table";
import { TeamCrest } from "@/components/team-crest";
import { TeamLink } from "@/components/team-link";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useTournamentStore } from "@/hooks/useTournamentStore";
import { buildMatchPredictionBreakdown, calculateMatchWinProbability } from "@/lib/simulations/elo";
import { runTournamentMonteCarlo } from "@/lib/simulations/monteCarlo";
import { createTeamMap } from "@/lib/utils/data";
import { cn } from "@/lib/utils/cn";
import type { BracketFixture, GroupMatchOutcome, Match, Team, TournamentSimulationSummary } from "@/types";

interface BracketExperienceProps {
  teams: Team[];
  matches: Match[];
  initialSummary: TournamentSimulationSummary;
}

type ForecastTab = "GROUP_STAGE" | "KNOCKOUT_ROUNDS";

const forecastTabs: Array<{ id: ForecastTab; label: string; description: string }> = [
  {
    id: "GROUP_STAGE",
    label: "Group Stage",
    description: "Projected tables, bubble teams, and per-match model reads before the bracket starts.",
  },
  {
    id: "KNOCKOUT_ROUNDS",
    label: "Knockout Rounds",
    description: "A true bracket layout with live model explanations, upset locks, and downstream recalculation.",
  },
];

const knockoutRoundOrder = ["ROUND_OF_32", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"] as const;

function buildSeedFromSummary(summary: TournamentSimulationSummary) {
  const parsed = Date.parse(summary.generatedAt);
  return Number.isFinite(parsed) ? parsed : 20260611;
}

function formatKickoff(kickoff?: string) {
  if (!kickoff) return "Kickoff pending";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(kickoff));
}

function getFixtureTitle(homeTeam: Team, awayTeam: Team) {
  return `${homeTeam.code} vs ${awayTeam.code}`;
}

function getResolvedWinnerId(fixture?: BracketFixture) {
  if (!fixture) return null;
  return fixture.overriddenWinnerTeamId ?? fixture.winnerTeamId ?? fixture.explanation?.favoriteTeamId ?? null;
}

function getResolvedWinnerProbability(fixture?: BracketFixture, winnerTeamId?: string | null) {
  if (!fixture || !winnerTeamId) return null;
  if (winnerTeamId === fixture.homeTeamId) return fixture.homeWinProbability;
  if (winnerTeamId === fixture.awayTeamId) return fixture.awayWinProbability;
  return null;
}

function getModelGroupOutcome(probabilities: {
  home: number;
  draw: number;
  away: number;
  explanation?: {
    projectedOutcome?: GroupMatchOutcome;
  };
}): GroupMatchOutcome {
  if (probabilities.explanation?.projectedOutcome) {
    return probabilities.explanation.projectedOutcome;
  }

  if (probabilities.home >= probabilities.draw && probabilities.home >= probabilities.away) {
    return "HOME";
  }

  if (probabilities.away >= probabilities.home && probabilities.away >= probabilities.draw) {
    return "AWAY";
  }

  return "DRAW";
}

export function BracketExperience({ teams, matches, initialSummary }: BracketExperienceProps) {
  const storedSimulationRef = useRef<TournamentSimulationSummary | null>(useTournamentStore.getState().currentSimulation);
  const seededSummary = storedSimulationRef.current ?? initialSummary;
  const teamMap = useMemo(() => createTeamMap(teams), [teams]);
  const [summary, setSummary] = useState(seededSummary);
  const [activeTab, setActiveTab] = useState<ForecastTab>("KNOCKOUT_ROUNDS");
  const [selectedKnockoutFixtureId, setSelectedKnockoutFixtureId] = useState(
    seededSummary.bracket.ROUND_OF_32?.[0]?.id ?? seededSummary.bracket.ROUND_OF_16?.[0]?.id ?? "",
  );
  const [selectedGroupFixtureId, setSelectedGroupFixtureId] = useState("");
  const [activeSeed, setActiveSeed] = useState(() => buildSeedFromSummary(seededSummary));
  const [isPending, startTransition] = useTransition();
  const lastOverrideSignatureRef = useRef("{}");

  const selectedGroup = useTournamentStore((state) => state.selectedGroup);
  const setSelectedGroup = useTournamentStore((state) => state.setSelectedGroup);
  const iterations = useTournamentStore((state) => state.simulationIterations);
  const setIterations = useTournamentStore((state) => state.setSimulationIterations);
  const modelSettings = useTournamentStore((state) => state.modelSettings);
  const setModelWeight = useTournamentStore((state) => state.setModelWeight);
  const resetModelSettings = useTournamentStore((state) => state.resetModelSettings);
  const winnerOverrides = useTournamentStore((state) => state.winnerOverrides);
  const setWinnerOverride = useTournamentStore((state) => state.setWinnerOverride);
  const groupMatchOverrides = useTournamentStore((state) => state.groupMatchOverrides);
  const setGroupMatchOverride = useTournamentStore((state) => state.setGroupMatchOverride);
  const clearWinnerOverrides = useTournamentStore((state) => state.clearWinnerOverrides);
  const hydrateSimulation = useTournamentStore((state) => state.hydrateSimulation);

  const simulationOverrideSignature = useMemo(
    () => JSON.stringify({ knockout: winnerOverrides, group: groupMatchOverrides }),
    [groupMatchOverrides, winnerOverrides],
  );
  const overrides = useMemo(
    () => Object.entries(winnerOverrides).map(([fixtureId, winnerTeamId]) => ({ fixtureId, winnerTeamId })),
    [winnerOverrides],
  );
  const groupOverrides = useMemo(
    () => Object.entries(groupMatchOverrides).map(([matchId, outcome]) => ({ matchId, outcome })),
    [groupMatchOverrides],
  );

  useEffect(() => {
    const baselineSummary = storedSimulationRef.current ?? initialSummary;

    setSummary(baselineSummary);
    setActiveSeed(buildSeedFromSummary(baselineSummary));
    setSelectedKnockoutFixtureId(
      baselineSummary.bracket.ROUND_OF_32?.[0]?.id ?? baselineSummary.bracket.ROUND_OF_16?.[0]?.id ?? "",
    );
    hydrateSimulation(baselineSummary);
    lastOverrideSignatureRef.current = JSON.stringify({
      knockout: useTournamentStore.getState().winnerOverrides,
      group: useTournamentStore.getState().groupMatchOverrides,
    });
  }, [hydrateSimulation, initialSummary]);

  useEffect(() => {
    if (simulationOverrideSignature === lastOverrideSignatureRef.current) {
      return;
    }

    lastOverrideSignatureRef.current = simulationOverrideSignature;

    startTransition(() => {
      const nextSummary = runTournamentMonteCarlo({
        teams,
        matches,
        iterations,
        seed: activeSeed,
        settings: modelSettings,
        overrides,
        groupOverrides,
      });

      setSummary(nextSummary);
      hydrateSimulation(nextSummary);
    });
  }, [activeSeed, groupOverrides, hydrateSimulation, iterations, matches, modelSettings, overrides, simulationOverrideSignature, teams]);

  const rerunSimulation = () => {
    const nextSeed = Date.now();
    setActiveSeed(nextSeed);

    startTransition(() => {
      const nextSummary = runTournamentMonteCarlo({
        teams,
        matches,
        iterations,
        seed: nextSeed,
        settings: modelSettings,
        overrides,
        groupOverrides,
      });

      setSummary(nextSummary);
      hydrateSimulation(nextSummary);
    });
  };

  const groupEntries = useMemo(() => Object.entries(summary.projectedGroups).sort(([left], [right]) => left.localeCompare(right)), [summary.projectedGroups]);
  const activeGroup = selectedGroup && summary.projectedGroups[selectedGroup] ? selectedGroup : groupEntries[0]?.[0] ?? "A";
  const activeGroupStandings = summary.projectedGroups[activeGroup] ?? [];
  const groupMatches = useMemo(
    () =>
      matches
        .filter((match) => match.stage === "GROUP" && match.group)
        .sort((left, right) => left.kickoff.localeCompare(right.kickoff)),
    [matches],
  );
  const groupMatchesByGroup = useMemo(
    () =>
      groupMatches.reduce<Record<string, Match[]>>((map, match) => {
        if (!match.group) return map;
        map[match.group] ??= [];
        map[match.group].push(match);
        return map;
      }, {}),
    [groupMatches],
  );
  const activeGroupMatches = useMemo(() => groupMatchesByGroup[activeGroup] ?? [], [activeGroup, groupMatchesByGroup]);
  const groupMatchModel = useMemo(
    () =>
      activeGroupMatches.reduce<
        Record<
          string,
          {
            home: number;
            draw: number;
            away: number;
            explanation: ReturnType<typeof buildMatchPredictionBreakdown>;
          }
        >
      >((map, match) => {
        const homeTeam = teamMap.get(match.homeTeamId);
        const awayTeam = teamMap.get(match.awayTeamId);

        if (!homeTeam || !awayTeam) return map;

        map[match.id] = {
          ...calculateMatchWinProbability(homeTeam, awayTeam, modelSettings),
          explanation: buildMatchPredictionBreakdown(homeTeam, awayTeam, modelSettings),
        };
        return map;
      }, {}),
    [activeGroupMatches, modelSettings, teamMap],
  );

  const knockoutFixtures = useMemo(
    () => knockoutRoundOrder.flatMap((round) => summary.bracket[round] ?? []),
    [summary.bracket],
  );

  useEffect(() => {
    if (!activeGroupMatches.length) {
      setSelectedGroupFixtureId("");
      return;
    }

    if (!activeGroupMatches.some((match) => match.id === selectedGroupFixtureId)) {
      setSelectedGroupFixtureId(activeGroupMatches[0].id);
    }
  }, [activeGroupMatches, selectedGroupFixtureId]);

  useEffect(() => {
    if (!knockoutFixtures.length) {
      setSelectedKnockoutFixtureId("");
      return;
    }

    if (!knockoutFixtures.some((fixture) => fixture.id === selectedKnockoutFixtureId)) {
      setSelectedKnockoutFixtureId(knockoutFixtures[0].id);
    }
  }, [knockoutFixtures, selectedKnockoutFixtureId]);

  const selectedGroupMatch = activeGroupMatches.find((match) => match.id === selectedGroupFixtureId) ?? activeGroupMatches[0];
  const selectedGroupMatchSnapshot = selectedGroupMatch ? groupMatchModel[selectedGroupMatch.id] : null;
  const selectedGroupOverrideOutcome = selectedGroupMatch ? groupMatchOverrides[selectedGroupMatch.id] : undefined;
  const selectedKnockoutFixture =
    knockoutFixtures.find((fixture) => fixture.id === selectedKnockoutFixtureId) ??
    summary.bracket.ROUND_OF_32?.[0] ??
    summary.bracket.ROUND_OF_16?.[0];

  const currentFinalFixture = summary.bracket.FINAL?.[0];
  const currentChampionId = getResolvedWinnerId(currentFinalFixture);
  const currentChampion = currentChampionId ? teamMap.get(currentChampionId) : null;
  const currentChampionProbability = getResolvedWinnerProbability(currentFinalFixture, currentChampionId);
  const currentFinalHome = currentFinalFixture ? teamMap.get(currentFinalFixture.homeTeamId) : null;
  const currentFinalAway = currentFinalFixture ? teamMap.get(currentFinalFixture.awayTeamId) : null;
  const lockedUpsets = useMemo(
    () =>
      knockoutFixtures.flatMap((fixture) => {
        const overrideWinnerId = fixture.overriddenWinnerTeamId;
        const favoriteTeamId = fixture.explanation?.favoriteTeamId;

        if (!overrideWinnerId || !favoriteTeamId || overrideWinnerId === favoriteTeamId) {
          return [];
        }

        const winner = teamMap.get(overrideWinnerId);
        const opponent = teamMap.get(overrideWinnerId === fixture.homeTeamId ? fixture.awayTeamId : fixture.homeTeamId);

        if (!winner || !opponent) {
          return [];
        }

        return [
          {
            fixtureId: fixture.id,
            roundLabel: fixture.roundLabel,
            winner,
            opponent,
          },
        ];
      }),
    [knockoutFixtures, teamMap],
  );
  const upsetLockCount = lockedUpsets.length;
  const groupLockCount = Object.keys(groupMatchOverrides).length;
  const groupWinner = activeGroupStandings[0];
  const secondPlace = activeGroupStandings[1];
  const thirdPlace = activeGroupStandings[2];

  const handleKnockoutOverride = (fixtureId: string, winnerTeamId?: string) => {
    if (!winnerTeamId) {
      setWinnerOverride(fixtureId);
      return;
    }

    const fixture = knockoutFixtures.find((candidate) => candidate.id === fixtureId);
    const favoriteTeamId = fixture?.explanation?.favoriteTeamId;

    if (!fixture || !favoriteTeamId || winnerTeamId === favoriteTeamId) {
      setWinnerOverride(fixtureId);
      return;
    }

    setWinnerOverride(fixtureId, winnerTeamId);
  };

  const handleGroupOutcomeOverride = (matchId: string, outcome?: GroupMatchOutcome) => {
    if (!outcome) {
      setGroupMatchOverride(matchId);
      return;
    }

    const snapshot = groupMatchModel[matchId];

    if (!snapshot) {
      setGroupMatchOverride(matchId);
      return;
    }

    const modelOutcome = getModelGroupOutcome(snapshot);

    if (outcome === modelOutcome) {
      setGroupMatchOverride(matchId);
      return;
    }

    setGroupMatchOverride(matchId, outcome);
  };

  return (
    <div className="space-y-6">
      <ForecastControls
        iterations={iterations}
        modelSettings={modelSettings}
        overrideCount={upsetLockCount}
        isPending={isPending}
        onSetIterations={setIterations}
        onWeightChange={setModelWeight}
        onResetWeights={resetModelSettings}
        onClearOverrides={clearWinnerOverrides}
        onRun={rerunSimulation}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.95fr]">
        <GlassPanel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Current bracket champion</p>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              {currentChampion ? (
                <TeamLink team={currentChampion} className="flex items-center gap-4">
                  <TeamCrest team={currentChampion} size="md" showFlag />
                  <div>
                    <p className="font-[family:var(--font-display)] text-4xl uppercase tracking-[0.04em] text-white">{currentChampion.code}</p>
                    <p className="mt-1 text-sm uppercase tracking-[0.18em] text-white/42 group-hover/team:text-emerald-200">{currentChampion.name}</p>
                  </div>
                </TeamLink>
              ) : (
                <p className="font-[family:var(--font-display)] text-4xl uppercase tracking-[0.04em] text-white">Ready</p>
              )}
              <p className="mt-4 text-sm leading-7 text-white/62">
                {currentChampion
                  ? `${currentChampion.name} currently sit at the end of the exact bracket path shown below.`
                  : "Run the forecast to generate a live bracket champion."}
              </p>
            </div>
            <div
              className={cn(
                "rounded-full px-4 py-2 text-sm",
                upsetLockCount
                  ? "border border-amber-300/22 bg-amber-300/10 text-amber-100"
                  : "border border-emerald-300/18 bg-emerald-400/10 text-emerald-100",
              )}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {upsetLockCount ? `${upsetLockCount} upset lock${upsetLockCount === 1 ? "" : "s"}` : "Model path"}
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-[20px] border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">Final matchup edge</p>
            <p className="mt-2 font-[family:var(--font-display)] text-2xl uppercase tracking-[0.04em] text-white">
              {currentChampionProbability?.toFixed(1) ?? "--"}%
            </p>
            <p className="mt-1 text-sm text-white/54">
              {upsetLockCount
                ? "This edge already includes your locked upset path."
                : "No upset locks are active, so this is the straight model line."}
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Current final matchup</p>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3 text-white">
              {currentFinalHome ? (
                <TeamLink team={currentFinalHome} className="flex items-center gap-3">
                  <TeamCrest team={currentFinalHome} size="sm" showFlag />
                  <span className="font-semibold group-hover/team:text-emerald-200">{currentFinalHome.name}</span>
                </TeamLink>
              ) : null}
              <ArrowRight className="h-4 w-4 text-white/28" />
              {currentFinalAway ? (
                <TeamLink team={currentFinalAway} className="flex items-center gap-3">
                  <TeamCrest team={currentFinalAway} size="sm" showFlag />
                  <span className="font-semibold group-hover/team:text-emerald-200">{currentFinalAway.name}</span>
                </TeamLink>
              ) : null}
            </div>
            <p className="text-sm leading-7 text-white/62">
              {upsetLockCount
                ? "This pairing is pulled directly from the bracket below after applying your current upset locks."
                : "This is the straight model final from the live bracket path below."}
            </p>
            {currentFinalFixture ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    team: currentFinalHome,
                    probability: currentFinalFixture.homeWinProbability,
                  },
                  {
                    team: currentFinalAway,
                    probability: currentFinalFixture.awayWinProbability,
                  },
                ].map((entry) =>
                  entry.team ? (
                    <div key={entry.team.id} className="rounded-[20px] border border-white/8 bg-white/4 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">{entry.team.code}</p>
                      <p className="mt-2 font-[family:var(--font-display)] text-2xl uppercase tracking-[0.04em] text-white">
                        {entry.probability.toFixed(1)}%
                      </p>
                      <p className="mt-1 text-sm text-white/54">win share on this final path</p>
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
            <Sparkles className="h-4 w-4 text-emerald-200" />
            Upset locks
          </div>
          <div className="mt-4 space-y-3">
            {lockedUpsets.length ? (
              <>
                {lockedUpsets.slice(0, 3).map((lock) => (
                  <div key={lock.fixtureId} className="flex items-center justify-between gap-3 rounded-[20px] border border-amber-300/14 bg-amber-300/8 px-4 py-3">
                    <TeamLink team={lock.winner} className="flex items-center gap-3">
                      <TeamCrest team={lock.winner} size="sm" showFlag />
                      <div>
                        <p className="font-semibold text-white group-hover/team:text-emerald-200">{lock.winner.name}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                          over {lock.opponent.code} • {lock.roundLabel}
                        </p>
                      </div>
                    </TeamLink>
                    <span className="rounded-full border border-amber-300/22 bg-amber-300/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
                      Locked upset
                    </span>
                  </div>
                ))}
                {lockedUpsets.length > 3 ? (
                  <p className="text-sm text-white/52">+{lockedUpsets.length - 3} more locked upsets are shaping the bracket below.</p>
                ) : null}
              </>
            ) : (
              <div className="rounded-[20px] border border-white/8 bg-white/4 px-4 py-4 text-sm leading-7 text-white/60">
                No upset locks are active. The bracket and summary cards above are both following the model line right now.
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      <GlassPanel className="p-2">
        <div className="grid gap-2 md:grid-cols-2">
          {forecastTabs.map((tab) => {
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-[24px] border px-5 py-4 text-left transition",
                  active
                    ? "border-emerald-300/26 bg-[linear-gradient(135deg,rgba(74,222,182,0.18),rgba(40,184,255,0.14))]"
                    : "border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/6",
                )}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                  {tab.id === "GROUP_STAGE" ? <Users className="h-4 w-4 text-emerald-200" /> : <GitBranch className="h-4 w-4 text-emerald-200" />}
                  {tab.label}
                </div>
                <p className="mt-3 font-[family:var(--font-display)] text-2xl uppercase tracking-[0.04em] text-white">{tab.label}</p>
                <p className="mt-2 text-sm leading-7 text-white/60">{tab.description}</p>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {activeTab === "GROUP_STAGE" ? (
        <div className="space-y-6">
          <GlassPanel className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Group selector</p>
                <p className="mt-2 text-sm leading-7 text-white/62">
                  Group tables are simulated from the current model settings. Since the tournament has not kicked off yet, this panel shows expected points and advancement odds instead of actual wins and losses.
                </p>
                <p className="mt-2 text-sm leading-7 text-emerald-100/85">
                  Same flow as knockout: select a group match on the left, inspect the details on the right, then lock a home win, draw, or away result. Those calls immediately update the table and the knockout path.
                </p>
              </div>
              <div className="space-y-3">
                <div className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/46">
                  {groupLockCount} group lock{groupLockCount === 1 ? "" : "s"}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                {groupEntries.map(([group]) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setSelectedGroup(group)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] transition",
                      group === activeGroup
                        ? "border-emerald-300/28 bg-emerald-400/12 text-emerald-100"
                        : "border-white/10 bg-white/4 text-white/62 hover:bg-white/8",
                    )}
                  >
                    Group {group}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </GlassPanel>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.92fr)] 2xl:grid-cols-[minmax(0,1fr)_500px]">
            <div className="space-y-6">
              <GroupTable group={activeGroup} standings={activeGroupStandings} teamMap={teamMap} />

              <GlassPanel className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Group {activeGroup} fixtures</p>
                    <p className="mt-2 text-sm leading-7 text-white/62">
                      Select a match to inspect the probability split, then lock a result if you want this group table and the knockout path to reflect your call.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "Projected winner",
                        standing: groupWinner,
                        value: groupWinner ? `${groupWinner.finishFirstPct.toFixed(1)}% win group` : "Waiting",
                      },
                      {
                        label: "Likely second",
                        standing: secondPlace,
                        value: secondPlace ? `${secondPlace.advancePct.toFixed(1)}% advance` : "Waiting",
                      },
                      {
                        label: "Third-place bubble",
                        standing: thirdPlace,
                        value: thirdPlace ? `${thirdPlace.advancePct.toFixed(1)}% survive` : "Waiting",
                      },
                    ].map((slot) => {
                      const team = slot.standing ? teamMap.get(slot.standing.teamId) : null;

                      return (
                        <div key={slot.label} className="rounded-[18px] border border-white/8 bg-white/4 px-4 py-3">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">{slot.label}</p>
                          <p className="mt-2 text-sm font-semibold text-white">{team ? team.code : "TBD"}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-emerald-100/82">{slot.value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 2xl:grid-cols-2">
                  {activeGroupMatches.map((match) => {
                    const snapshot = groupMatchModel[match.id];
                    const homeTeam = teamMap.get(match.homeTeamId);
                    const awayTeam = teamMap.get(match.awayTeamId);

                    if (!snapshot || !homeTeam || !awayTeam) {
                      return null;
                    }

                    const lockedOutcome = groupMatchOverrides[match.id];
                    const modelOutcome = getModelGroupOutcome(snapshot);
                    const hasGroupLock = Boolean(lockedOutcome);
                    const lockLabel =
                      lockedOutcome === "DRAW"
                        ? "Draw lock"
                        : lockedOutcome
                          ? "Result lock"
                          : modelOutcome === "DRAW"
                            ? "Model draw"
                            : `${modelOutcome === "HOME" ? homeTeam.code : awayTeam.code} edge`;

                    return (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => setSelectedGroupFixtureId(match.id)}
                        className={cn(
                          "rounded-[24px] border p-5 text-left transition",
                          selectedGroupMatch?.id === match.id
                            ? "border-emerald-300/26 bg-emerald-400/10 shadow-[0_18px_60px_rgba(12,130,108,0.2)]"
                            : hasGroupLock
                              ? "border-amber-300/24 bg-amber-300/10 shadow-[0_18px_60px_rgba(240,173,54,0.12)]"
                              : "border-white/10 bg-white/5 hover:bg-white/8",
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">{formatKickoff(match.kickoff)}</p>
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                              hasGroupLock
                                ? "border-amber-300/26 bg-amber-300/12 text-amber-100"
                                : "border-white/10 bg-white/4 text-white/40",
                            )}
                          >
                            {lockLabel}
                          </span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {[
                            { team: homeTeam, share: snapshot.home },
                            { team: awayTeam, share: snapshot.away },
                          ].map(({ team, share }) => (
                            <div key={team.id} className="flex items-center justify-between gap-3 rounded-[18px] border border-white/8 bg-white/4 px-3 py-2.5">
                              <div className="flex items-center gap-3">
                                <TeamCrest team={team} size="sm" showFlag />
                                <div>
                                  <p className="font-semibold text-white">{team.name}</p>
                                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">{team.code}</p>
                                </div>
                              </div>
                              <p className="font-[family:var(--font-display)] text-xl uppercase tracking-[0.05em] text-white">{share.toFixed(1)}%</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-white/40">
                          <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1">Draw {snapshot.draw.toFixed(1)}%</span>
                          <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1">Projected {snapshot.explanation.projectedScoreline}</span>
                          <span className="rounded-full border border-white/10 bg-white/4 px-3 py-1">{match.venue}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlassPanel>
            </div>

            {selectedGroupMatch && selectedGroupMatchSnapshot ? (
              <div className="xl:sticky xl:top-24">
                <FixtureStoryPanel
                  fixtureId={selectedGroupMatch.id}
                  mode="group"
                  title={getFixtureTitle(teamMap.get(selectedGroupMatch.homeTeamId)!, teamMap.get(selectedGroupMatch.awayTeamId)!)}
                  subtitle={`Group ${activeGroup} fixture • ${selectedGroupMatch.venue}, ${selectedGroupMatch.city}`}
                  homeTeam={teamMap.get(selectedGroupMatch.homeTeamId)!}
                  awayTeam={teamMap.get(selectedGroupMatch.awayTeamId)!}
                  homeProbability={selectedGroupMatchSnapshot.home}
                  drawProbability={selectedGroupMatchSnapshot.draw}
                  awayProbability={selectedGroupMatchSnapshot.away}
                  explanation={selectedGroupMatchSnapshot.explanation}
                  kickoff={formatKickoff(selectedGroupMatch.kickoff)}
                  venue={selectedGroupMatch.venue}
                  city={selectedGroupMatch.city}
                  groupOverrideOutcome={selectedGroupOverrideOutcome}
                  onGroupOverride={handleGroupOutcomeOverride}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <GlassPanel className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Bracket workspace</p>
                <p className="text-sm leading-7 text-white/62">
                  One bracket, one selected-match rail. Click any matchup on the left to inspect the model case, lock in an upset, and immediately watch the projected path update.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/46">
                {upsetLockCount} upset lock{upsetLockCount === 1 ? "" : "s"}
              </div>
            </div>
          </GlassPanel>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_500px] 2xl:grid-cols-[minmax(0,1fr)_540px]">
            <GlassPanel className="p-4">
              <BracketView
                bracket={summary.bracket}
                teamMap={teamMap}
                selectedFixtureId={selectedKnockoutFixture?.id}
                onSelectFixture={setSelectedKnockoutFixtureId}
              />
            </GlassPanel>

            {selectedKnockoutFixture ? (
              <div className="xl:sticky xl:top-24">
                <FixtureStoryPanel
                  fixtureId={selectedKnockoutFixture.id}
                  mode="knockout"
                  title={getFixtureTitle(teamMap.get(selectedKnockoutFixture.homeTeamId)!, teamMap.get(selectedKnockoutFixture.awayTeamId)!)}
                  subtitle={`${selectedKnockoutFixture.roundLabel} • ${selectedKnockoutFixture.venue}, ${selectedKnockoutFixture.city}`}
                  homeTeam={teamMap.get(selectedKnockoutFixture.homeTeamId)!}
                  awayTeam={teamMap.get(selectedKnockoutFixture.awayTeamId)!}
                  homeProbability={selectedKnockoutFixture.homeWinProbability}
                  awayProbability={selectedKnockoutFixture.awayWinProbability}
                  explanation={selectedKnockoutFixture.explanation!}
                  kickoff={formatKickoff(selectedKnockoutFixture.kickoff)}
                  venue={selectedKnockoutFixture.venue}
                  city={selectedKnockoutFixture.city}
                  overrideWinnerId={winnerOverrides[selectedKnockoutFixture.id]}
                  onOverride={handleKnockoutOverride}
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

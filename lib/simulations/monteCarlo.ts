import { buildKnockoutBracket } from "@/lib/simulations/bracket";
import { DEFAULT_SIMULATION_WEIGHTS, getBlendedTeamStrength } from "@/lib/simulations/elo";
import { simulateGroupStage } from "@/lib/simulations/groupStage";
import type {
  BracketFixture,
  GroupMatchOverride,
  GroupStanding,
  Match,
  PredictionResult,
  ProjectedGroupStanding,
  SimulationWeights,
  Team,
  TournamentSimulationSummary,
  WinnerOverride,
} from "@/types";

function createSeededRandom(seed: number) {
  let current = seed >>> 0;

  return function random() {
    current += 0x6d2b79f5;
    let value = Math.imul(current ^ (current >>> 15), 1 | current);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function sortProjectedEntries(entries: ProjectedGroupStanding[]) {
  return [...entries].sort((left, right) => {
    if (right.projectedPoints !== left.projectedPoints) return right.projectedPoints - left.projectedPoints;
    if (right.projectedGoalDifference !== left.projectedGoalDifference) return right.projectedGoalDifference - left.projectedGoalDifference;
    if (right.projectedGoalsFor !== left.projectedGoalsFor) return right.projectedGoalsFor - left.projectedGoalsFor;
    return right.advancePct - left.advancePct;
  });
}

function createProjectedSeedMap(projectedGroups: Record<string, ProjectedGroupStanding[]>) {
  return Object.entries(projectedGroups).reduce<Record<string, string>>((map, [group, standings]) => {
    standings.forEach((standing, index) => {
      map[`${group}${index + 1}`] = standing.teamId;
    });
    return map;
  }, {});
}

function getProjectedQualifiedThirdGroups(projectedGroups: Record<string, ProjectedGroupStanding[]>) {
  return Object.values(projectedGroups)
    .map((entries) => entries[2])
    .sort((left, right) => {
      if (right.projectedPoints !== left.projectedPoints) return right.projectedPoints - left.projectedPoints;
      if (right.projectedGoalDifference !== left.projectedGoalDifference) return right.projectedGoalDifference - left.projectedGoalDifference;
      if (right.projectedGoalsFor !== left.projectedGoalsFor) return right.projectedGoalsFor - left.projectedGoalsFor;
      return right.advancePct - left.advancePct;
    })
    .slice(0, 8)
    .map((standing) => standing.group);
}

function buildProjectedGroups({
  teams,
  groupTotals,
  groupWinCounts,
  advanceCounts,
  iterations,
}: {
  teams: Team[];
  groupTotals: Record<string, { points: number; goalDifference: number; goalsFor: number; wins: number; draws: number; losses: number }>;
  groupWinCounts: Map<string, number>;
  advanceCounts: Map<string, number>;
  iterations: number;
}) {
  const groups = teams.reduce<Record<string, ProjectedGroupStanding[]>>((map, team) => {
    const aggregate = groupTotals[team.id];
    const projectedPoints = Number((aggregate.points / iterations).toFixed(2));
    const projectedGoalDifference = Number((aggregate.goalDifference / iterations).toFixed(2));
    const projectedGoalsFor = Number((aggregate.goalsFor / iterations).toFixed(2));
    const finishFirstPct = Number((((groupWinCounts.get(team.id) ?? 0) / iterations) * 100).toFixed(1));
    const advancePct = Number((((advanceCounts.get(team.id) ?? 0) / iterations) * 100).toFixed(1));

    map[team.group] ??= [];
    map[team.group].push({
      teamId: team.id,
      group: team.group,
      played: 3,
      won: Math.round(aggregate.wins / iterations),
      drawn: Math.round(aggregate.draws / iterations),
      lost: Math.round(aggregate.losses / iterations),
      goalsFor: Math.round(projectedGoalsFor),
      goalsAgainst: Math.round(projectedGoalsFor - projectedGoalDifference),
      goalDifference: Math.round(projectedGoalDifference),
      points: Math.round(projectedPoints),
      qualificationStatus: "alive",
      projectedPoints,
      projectedGoalDifference,
      projectedGoalsFor,
      finishFirstPct,
      advancePct,
    });
    return map;
  }, {});

  Object.entries(groups).forEach(([group, entries]) => {
    const sorted = sortProjectedEntries(entries);
    sorted.forEach((entry, index) => {
      if (index < 2) {
        entry.qualificationStatus = "qualified";
      } else if (index === 2) {
        entry.qualificationStatus = entry.advancePct >= 40 ? "qualified" : "alive";
      } else {
        entry.qualificationStatus = entry.advancePct >= 10 ? "alive" : "eliminated";
      }
    });
    groups[group] = sorted;
  });

  return groups;
}

function calculateProjectedPathContext(teamId: string, bracket: Record<string, BracketFixture[]>, teamMap: Map<string, Team>) {
  const fixtures = Object.values(bracket)
    .flat()
    .filter((fixture) => fixture.homeTeamId === teamId || fixture.awayTeamId === teamId);

  if (!fixtures.length) {
    return {
      pathDifficulty: 58,
      upsetLikelihood: 52,
    };
  }

  const difficulties = fixtures.map((fixture) => {
    const opponentId = fixture.homeTeamId === teamId ? fixture.awayTeamId : fixture.homeTeamId;
    const opponent = teamMap.get(opponentId);
    return opponent ? getBlendedTeamStrength(opponent) : 1500;
  });
  const upsetShares = fixtures.map((fixture) =>
    fixture.homeTeamId === teamId ? 100 - fixture.homeWinProbability : 100 - fixture.awayWinProbability,
  );
  const averageDifficulty = difficulties.reduce((total, value) => total + value, 0) / difficulties.length;
  const difficultyScale = Math.round(Math.min(Math.max((averageDifficulty - 1380) / 8.5, 48), 92));
  const upsetLikelihood = Number((upsetShares.reduce((total, value) => total + value, 0) / upsetShares.length).toFixed(1));

  return {
    pathDifficulty: difficultyScale,
    upsetLikelihood,
  };
}

export function runTournamentMonteCarlo({
  teams,
  matches,
  iterations = 3500,
  seed = 20260611,
  settings = DEFAULT_SIMULATION_WEIGHTS,
  overrides = [],
  groupOverrides = [],
}: {
  teams: Team[];
  matches: Match[];
  baselinePredictions?: PredictionResult[];
  standings?: GroupStanding[];
  iterations?: number;
  seed?: number;
  settings?: SimulationWeights;
  overrides?: WinnerOverride[];
  groupOverrides?: GroupMatchOverride[];
}): TournamentSimulationSummary {
  const random = createSeededRandom(seed);
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const groupWinCounts = new Map<string, number>();
  const advanceCounts = new Map<string, number>();
  const quarterfinalCounts = new Map<string, number>();
  const semifinalCounts = new Map<string, number>();
  const finalCounts = new Map<string, number>();
  const championCounts = new Map<string, number>();
  const finalMatchupCounts = new Map<string, number>();
  const finalOpponentCounts = new Map<string, Map<string, number>>();
  const groupTotals = teams.reduce<Record<string, { points: number; goalDifference: number; goalsFor: number; wins: number; draws: number; losses: number }>>(
    (map, team) => {
      map[team.id] = { points: 0, goalDifference: 0, goalsFor: 0, wins: 0, draws: 0, losses: 0 };
      groupWinCounts.set(team.id, 0);
      advanceCounts.set(team.id, 0);
      quarterfinalCounts.set(team.id, 0);
      semifinalCounts.set(team.id, 0);
      finalCounts.set(team.id, 0);
      championCounts.set(team.id, 0);
      finalOpponentCounts.set(team.id, new Map());
      return map;
    },
    {},
  );

  for (let index = 0; index < iterations; index += 1) {
    /**
     * Every iteration simulates the full tournament path:
     * 1. play the 72 group matches,
     * 2. rank the 12 groups and best third-place teams,
     * 3. resolve the Round of 32 and advance through the bracket.
     */
    const groupStage = simulateGroupStage({
      teams,
      matches,
      random,
      settings,
      overrides: groupOverrides,
    });

    Object.values(groupStage.rankedGroups).forEach((standings) => {
      standings.forEach((standing, standingIndex) => {
        const aggregate = groupTotals[standing.teamId];
        aggregate.points += standing.points;
        aggregate.goalDifference += standing.goalDifference;
        aggregate.goalsFor += standing.goalsFor;
        aggregate.wins += standing.won;
        aggregate.draws += standing.drawn;
        aggregate.losses += standing.lost;

        if (standingIndex === 0) {
          groupWinCounts.set(standing.teamId, (groupWinCounts.get(standing.teamId) ?? 0) + 1);
        }

        if (standing.qualificationStatus === "qualified") {
          advanceCounts.set(standing.teamId, (advanceCounts.get(standing.teamId) ?? 0) + 1);
        }
      });
    });

    const knockout = buildKnockoutBracket({
      seedMap: groupStage.seedMap,
      qualifiedThirdGroups: groupStage.qualifiedThirdGroups,
      teams,
      settings,
      random,
      overrides,
    });

    knockout.bracket.ROUND_OF_32.forEach((fixture) => {
      if (fixture.winnerTeamId) {
        quarterfinalCounts.set(fixture.winnerTeamId, (quarterfinalCounts.get(fixture.winnerTeamId) ?? 0) + 1);
      }
    });

    knockout.bracket.ROUND_OF_16.forEach((fixture) => {
      if (fixture.winnerTeamId) {
        semifinalCounts.set(fixture.winnerTeamId, (semifinalCounts.get(fixture.winnerTeamId) ?? 0) + 1);
      }
    });

    knockout.bracket.QUARTERFINAL.forEach((fixture) => {
      if (fixture.winnerTeamId) {
        finalCounts.set(fixture.winnerTeamId, (finalCounts.get(fixture.winnerTeamId) ?? 0) + 1);
      }
    });

    const finalFixture = knockout.bracket.FINAL[0];

    if (finalFixture) {
      const matchupKey = [finalFixture.homeTeamId, finalFixture.awayTeamId].sort().join("_");
      finalMatchupCounts.set(matchupKey, (finalMatchupCounts.get(matchupKey) ?? 0) + 1);
      finalOpponentCounts.get(finalFixture.homeTeamId)?.set(
        finalFixture.awayTeamId,
        (finalOpponentCounts.get(finalFixture.homeTeamId)?.get(finalFixture.awayTeamId) ?? 0) + 1,
      );
      finalOpponentCounts.get(finalFixture.awayTeamId)?.set(
        finalFixture.homeTeamId,
        (finalOpponentCounts.get(finalFixture.awayTeamId)?.get(finalFixture.homeTeamId) ?? 0) + 1,
      );

      if (finalFixture.winnerTeamId) {
        championCounts.set(finalFixture.winnerTeamId, (championCounts.get(finalFixture.winnerTeamId) ?? 0) + 1);
      }
    }
  }

  const projectedGroups = buildProjectedGroups({
    teams,
    groupTotals,
    groupWinCounts,
    advanceCounts,
    iterations,
  });
  const projectedSeedMap = createProjectedSeedMap(projectedGroups);
  const projectedQualifiedThirdGroups = getProjectedQualifiedThirdGroups(projectedGroups);
  const projectedBracket = buildKnockoutBracket({
    seedMap: projectedSeedMap,
    qualifiedThirdGroups: projectedQualifiedThirdGroups,
    teams,
    settings,
    overrides,
  }).bracket;
  const strengths = teams.map((team) => getBlendedTeamStrength(team, settings));
  const minStrength = Math.min(...strengths);
  const maxStrength = Math.max(...strengths);

  const teamOdds = teams
    .map((team) => {
      const strength = getBlendedTeamStrength(team, settings);
      const normalizedStrength = (strength - minStrength) / Math.max(maxStrength - minStrength, 1);
      const projectedContext = calculateProjectedPathContext(team.id, projectedBracket, teamMap);
      const likelyFinalOpponents = [...(finalOpponentCounts.get(team.id)?.entries() ?? [])].sort((left, right) => right[1] - left[1]);
      const championCount = championCounts.get(team.id) ?? 0;

      return {
        teamId: team.id,
        advancePct: Number((((advanceCounts.get(team.id) ?? 0) / iterations) * 100).toFixed(1)),
        quarterfinalPct: Number((((quarterfinalCounts.get(team.id) ?? 0) / iterations) * 100).toFixed(1)),
        semifinalPct: Number((((semifinalCounts.get(team.id) ?? 0) / iterations) * 100).toFixed(1)),
        finalPct: Number((((finalCounts.get(team.id) ?? 0) / iterations) * 100).toFixed(1)),
        tournamentWinPct: Number(((championCount / iterations) * 100).toFixed(1)),
        upsetLikelihood: projectedContext.upsetLikelihood,
        pathDifficulty: projectedContext.pathDifficulty,
        powerRating: Math.round(60 + normalizedStrength * 38),
        mostLikelyFinalOpponentId: likelyFinalOpponents[0]?.[0] ?? teams.find((candidate) => candidate.id !== team.id)?.id ?? team.id,
        championCount,
      };
    })
    .sort((left, right) => right.tournamentWinPct - left.tournamentWinPct || right.powerRating - left.powerRating);

  const [mostLikelyFinalKey = `${teamOdds[0]?.teamId ?? teams[0].id}_${teamOdds[1]?.teamId ?? teams[1].id}`] =
    [...finalMatchupCounts.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];
  const [homeTeamId, awayTeamId] = mostLikelyFinalKey.split("_");
  const finalMatchupProbability = finalMatchupCounts.get(mostLikelyFinalKey) ?? 0;

  return {
    iterations,
    generatedAt: new Date().toISOString(),
    modelSettings: settings,
    championTeamId: teamOdds[0]?.teamId ?? teams[0].id,
    finalMatchup: {
      homeTeamId,
      awayTeamId,
      probability: Number(((finalMatchupProbability / iterations) * 100).toFixed(1)),
    },
    projectedGroups,
    teamOdds,
    bracket: projectedBracket,
  };
}

import type { GroupMatchOverride, GroupStanding, Match, Team } from "@/types";
import { getBlendedTeamStrength, getExpectedGoals, simulateMatchScore } from "@/lib/simulations/elo";

function createBlankStanding(team: Team): GroupStanding {
  return {
    teamId: team.id,
    group: team.group,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    qualificationStatus: "alive",
  };
}

function cloneStandings(teams: Team[]) {
  return teams.reduce<Record<string, GroupStanding>>((map, team) => {
    map[team.id] = createBlankStanding(team);
    return map;
  }, {});
}

function updateStanding(standing: GroupStanding, goalsFor: number, goalsAgainst: number) {
  standing.played += 1;
  standing.goalsFor += goalsFor;
  standing.goalsAgainst += goalsAgainst;
  standing.goalDifference = standing.goalsFor - standing.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    standing.won += 1;
    standing.points += 3;
    return;
  }

  if (goalsFor < goalsAgainst) {
    standing.lost += 1;
    return;
  }

  standing.drawn += 1;
  standing.points += 1;
}

export function sortGroupStandings(standings: GroupStanding[], teamMap: Map<string, Team>) {
  return [...standings].sort((left, right) => {
    if (right.points !== left.points) return right.points - left.points;
    if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference;
    if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;

    /**
     * We do not have a full head-to-head mini-table inside every Monte Carlo
     * branch, so blended strength is used as the last deterministic tie-breaker
     * before falling back to team id order.
     */
    const leftTeam = teamMap.get(left.teamId);
    const rightTeam = teamMap.get(right.teamId);

    if (leftTeam && rightTeam) {
      const rightStrength = getBlendedTeamStrength(rightTeam);
      const leftStrength = getBlendedTeamStrength(leftTeam);
      if (rightStrength !== leftStrength) return rightStrength - leftStrength;
    }

    return left.teamId.localeCompare(right.teamId);
  });
}

export function rankThirdPlaceTeams(standings: GroupStanding[], teamMap: Map<string, Team>) {
  return sortGroupStandings(standings, teamMap).slice(0, 8);
}

function resolveLockedGroupScore(homeTeam: Team, awayTeam: Team, outcome: GroupMatchOverride["outcome"], settings: Parameters<typeof simulateMatchScore>[3]) {
  const expectedGoals = getExpectedGoals(homeTeam, awayTeam, settings);
  const roundedHome = Math.max(0, Math.round(expectedGoals.home));
  const roundedAway = Math.max(0, Math.round(expectedGoals.away));

  if (outcome === "DRAW") {
    const sharedGoals = Math.max(0, Math.round((expectedGoals.home + expectedGoals.away) / 2 - 0.15));
    return {
      home: sharedGoals,
      away: sharedGoals,
    };
  }

  if (outcome === "HOME") {
    const homeGoals = Math.max(1, roundedHome, roundedAway + 1);
    const awayGoals = Math.min(homeGoals - 1, Math.max(0, roundedAway));

    return {
      home: homeGoals,
      away: awayGoals,
    };
  }

  const awayGoals = Math.max(1, roundedAway, roundedHome + 1);
  const homeGoals = Math.min(awayGoals - 1, Math.max(0, roundedHome));

  return {
    home: homeGoals,
    away: awayGoals,
  };
}

export function simulateGroupStage({
  teams,
  matches,
  random,
  settings,
  overrides = [],
}: {
  teams: Team[];
  matches: Match[];
  random: () => number;
  settings: Parameters<typeof simulateMatchScore>[3];
  overrides?: GroupMatchOverride[];
}) {
  const standingsMap = cloneStandings(teams);
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const groupMatches = matches.filter((match) => match.stage === "GROUP");
  const overridesByMatchId = overrides.reduce<Record<string, GroupMatchOverride["outcome"]>>((map, override) => {
    map[override.matchId] = override.outcome;
    return map;
  }, {});

  for (const match of groupMatches) {
    const homeTeam = teamMap.get(match.homeTeamId);
    const awayTeam = teamMap.get(match.awayTeamId);

    if (!homeTeam || !awayTeam) {
      throw new Error(`Missing teams for simulated group fixture ${match.id}`);
    }

    const lockedOutcome = overridesByMatchId[match.id];
    const result = lockedOutcome
      ? resolveLockedGroupScore(homeTeam, awayTeam, lockedOutcome, settings)
      : simulateMatchScore(homeTeam, awayTeam, random, settings);
    updateStanding(standingsMap[homeTeam.id], result.home, result.away);
    updateStanding(standingsMap[awayTeam.id], result.away, result.home);
  }

  const grouped = teams.reduce<Record<string, GroupStanding[]>>((map, team) => {
    map[team.group] ??= [];
    map[team.group].push(standingsMap[team.id]);
    return map;
  }, {});

  const rankedGroups = Object.fromEntries(
    Object.entries(grouped).map(([group, standings]) => [group, sortGroupStandings(standings, teamMap)]),
  ) as Record<string, GroupStanding[]>;

  const thirdPlaceTeams = Object.values(rankedGroups).map((entries) => entries[2]);
  const qualifiedThirdPlaceTeams = rankThirdPlaceTeams(thirdPlaceTeams, teamMap);
  const qualifiedThirdGroups = qualifiedThirdPlaceTeams.map((standing) => standing.group);
  const seedMap: Record<string, string> = {};

  Object.entries(rankedGroups).forEach(([group, standings]) => {
    standings.forEach((standing, index) => {
      seedMap[`${group}${index + 1}`] = standing.teamId;

      if (index < 2 || qualifiedThirdGroups.includes(group) && index === 2) {
        standing.qualificationStatus = "qualified";
      } else {
        standing.qualificationStatus = "eliminated";
      }
    });
  });

  return {
    standings: Object.values(rankedGroups).flat(),
    rankedGroups,
    seedMap,
    qualifiedThirdPlaceTeams,
    qualifiedThirdGroups,
  };
}

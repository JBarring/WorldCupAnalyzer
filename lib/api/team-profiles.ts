import { TEAM_PROFILE_META } from "@/data/teamProfiles";
import { getMatchesSource, getTeamsSource } from "@/lib/api/data-source";
import { getBlendedTeamStrength } from "@/lib/simulations/elo";
import { attachTeamsToMatch, createTeamMap } from "@/lib/utils/data";
import type { HydratedMatch, RecentTeamResult, Team, TeamProfile, TeamProfileSnapshot } from "@/types";

const COMPETITIONS_BY_CONFEDERATION: Record<string, string[]> = {
  UEFA: ["European Qualifier", "Nations League", "International Friendly"],
  CONMEBOL: ["World Cup Qualifier", "Intercontinental Friendly", "Copa Tune-Up"],
  CONCACAF: ["Nations League", "Gold Cup Prep", "World Cup Qualifier"],
  AFC: ["Asian Qualifier", "Asian Cup Prep", "International Friendly"],
  CAF: ["AFCON Qualifier", "World Cup Qualifier", "International Friendly"],
  OFC: ["OFC Qualifier", "Intercontinental Playoff Prep", "International Friendly"],
};

function hashValue(input: string) {
  return input.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function rotateArray<T>(items: T[], offset: number) {
  if (!items.length) return items;
  const index = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(index), ...items.slice(0, index)];
}

function deriveHistoricalResult(team: Team, opponent: Team, index: number): "W" | "D" | "L" {
  const strengthGap = getBlendedTeamStrength(team) - getBlendedTeamStrength(opponent);
  const edge = strengthGap + ((hashValue(`${team.id}-${opponent.id}-${index}`) % 55) - 27);

  if (edge > 90) return "W";
  if (edge < -90) return "L";
  if (Math.abs(edge) < 32) return "D";

  return edge > 0 ? "W" : "L";
}

function buildScoreline(result: "W" | "D" | "L", team: Team, opponent: Team, index: number) {
  const seed = hashValue(`${team.id}-${opponent.id}-${index}`);
  const swing = Math.round((getBlendedTeamStrength(team) - getBlendedTeamStrength(opponent)) / 200);

  if (result === "D") {
    const drawScores = [
      [0, 0],
      [1, 1],
      [2, 2],
    ] as const;

    const [goalsFor, goalsAgainst] = drawScores[seed % drawScores.length];
    return { goalsFor, goalsAgainst };
  }

  const winScores = [
    [1, 0],
    [2, 1],
    [2, 0],
    [3, 1],
  ] as const;
  const lossScores = [
    [0, 1],
    [1, 2],
    [0, 2],
    [1, 3],
  ] as const;

  if (result === "W") {
    const [baseFor, baseAgainst] = winScores[seed % winScores.length];
    return { goalsFor: Math.max(baseFor + Math.max(swing, 0), 1), goalsAgainst: Math.max(baseAgainst - Math.max(swing - 1, 0), 0) };
  }

  const [baseFor, baseAgainst] = lossScores[seed % lossScores.length];
  return { goalsFor: Math.max(baseFor + Math.min(swing + 1, 0), 0), goalsAgainst: Math.max(baseAgainst + Math.max(-swing - 1, 0), 1) };
}

function buildRecentResults(team: Team, teams: Team[]): RecentTeamResult[] {
  const opponents = rotateArray(
    teams
      .filter((candidate) => candidate.id !== team.id)
      .sort((left, right) => hashValue(`${team.id}-${left.id}`) - hashValue(`${team.id}-${right.id}`)),
    hashValue(team.id) % Math.max(teams.length - 1, 1),
  ).slice(0, 10);

  return opponents.map((opponent, index) => {
    const result = index < team.form.length ? team.form[index] : deriveHistoricalResult(team, opponent, index);
    const { goalsFor, goalsAgainst } = buildScoreline(result, team, opponent, index);
    const venueCycle: Array<RecentTeamResult["venue"]> = ["Home", "Away", "Neutral"];
    const competitions = COMPETITIONS_BY_CONFEDERATION[team.confederation] ?? ["International Friendly"];
    const matchDate = new Date(Date.UTC(2026, 4, 30 - index * 9, 19, 0, 0));

    return {
      date: matchDate.toISOString(),
      opponentTeamId: opponent.id,
      goalsFor,
      goalsAgainst,
      result,
      venue: venueCycle[(hashValue(`${opponent.id}-${team.id}-${index}`) + index) % venueCycle.length],
      competition: competitions[index % competitions.length],
    };
  });
}

function buildFallbackProfile(team: Team): Omit<TeamProfile, "teamId" | "recentResults"> {
  const formationByConfederation: Record<string, [string, string]> = {
    UEFA: ["4-2-3-1", "4-3-3"],
    CONMEBOL: ["4-3-3", "4-4-2"],
    CONCACAF: ["4-3-3", "4-2-3-1"],
    AFC: ["4-2-3-1", "4-4-2"],
    CAF: ["4-3-3", "4-2-3-1"],
    OFC: ["4-4-2", "4-2-3-1"],
  };
  const [preferredFormation, alternateFormation] = formationByConfederation[team.confederation] ?? ["4-3-3", "4-2-3-1"];

  return {
    captain: `${team.shortName} captain`,
    preferredFormation,
    alternateFormation,
    styleLabel: `${team.shortName} project as a structured ${team.confederation} side in the current snapshot, with the model leaning on rating strength, form trend, and projected game control rather than a live lineup feed.`,
    overview: `${team.name} are loaded here as part of the official 2026 World Cup field. This scouting page uses the current schedule plus the imported model inputs, and can be upgraded later with live squads, confirmed call-ups, and federation-specific data feeds.`,
    keyPlayers: [`${team.shortName} core`, "Roster snapshot pending", "Live squad sync later"],
    strengths: ["Transition threat", "Set-piece value", "Tournament adaptability"],
  };
}

export async function getTeamProfileSnapshot(teamId: string): Promise<TeamProfileSnapshot | null> {
  const [teams, matches] = await Promise.all([getTeamsSource(), getMatchesSource()]);
  const team = teams.find((entry) => entry.id === teamId || entry.code === teamId) ?? null;

  if (!team) {
    return null;
  }

  const teamMap = createTeamMap(teams);
  const profileMeta = TEAM_PROFILE_META[team.id];

  const tournamentMatches = matches
    .filter((match) => match.homeTeamId === team.id || match.awayTeamId === team.id)
    .sort((left, right) => left.kickoff.localeCompare(right.kickoff))
    .map((match) => attachTeamsToMatch(match, teamMap)) as HydratedMatch[];

  return {
    team,
    profile: {
      teamId: team.id,
      ...(profileMeta ?? buildFallbackProfile(team)),
      recentResults: buildRecentResults(team, teams),
    },
    tournamentMatches,
  };
}

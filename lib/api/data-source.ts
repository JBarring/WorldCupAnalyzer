import eventsData from "@/data/events.json";
import groupsData from "@/data/groups.json";
import knockoutData from "@/data/knockout.json";
import matchesData from "@/data/matches.json";
import predictionsData from "@/data/predictions.json";
import teamsData from "@/data/teams.json";
import { normalizeGroupCode } from "@/lib/utils/tournament";
import type { GroupStanding, KnockoutTemplateFixture, Match, MatchEvent, PredictionResult, Team } from "@/types";

/**
 * This file is the MVP's data access boundary.
 *
 * Today it imports local JSON so the product can move quickly with zero
 * infrastructure. Later, the same exported functions can be re-pointed at
 * Prisma repositories, a live sports provider, or a caching layer without
 * rewriting page-level code.
 */
export async function getTeamsSource(): Promise<Team[]> {
  return teamsData as Team[];
}

export async function getMatchesSource(): Promise<Match[]> {
  const teams = teamsData as Team[];
  const teamMap = new Map(teams.map((team) => [team.id, team]));

  return (matchesData as Match[]).map((match) => {
    if (match.stage !== "GROUP") {
      return match;
    }

    const homeGroup = normalizeGroupCode(teamMap.get(match.homeTeamId)?.group);
    const awayGroup = normalizeGroupCode(teamMap.get(match.awayTeamId)?.group);
    const inferredGroup = homeGroup && homeGroup === awayGroup ? homeGroup : null;
    const importedGroup = normalizeGroupCode(match.group);
    const normalizedGroup = inferredGroup ?? importedGroup ?? match.group;

    return {
      ...match,
      group: normalizedGroup ?? undefined,
    };
  });
}

export async function getStandingsSource(): Promise<GroupStanding[]> {
  return groupsData as GroupStanding[];
}

export async function getEventsSource(): Promise<MatchEvent[]> {
  return eventsData as MatchEvent[];
}

export async function getPredictionsSource(): Promise<PredictionResult[]> {
  return predictionsData as PredictionResult[];
}

export async function getKnockoutSource(): Promise<KnockoutTemplateFixture[]> {
  return knockoutData as KnockoutTemplateFixture[];
}

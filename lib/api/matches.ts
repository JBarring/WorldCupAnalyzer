import { getEventsSource, getMatchesSource, getTeamsSource } from "@/lib/api/data-source";
import { buildProjectedMomentum, buildProjectedStatLine, calculateMatchWinProbability, DEFAULT_SIMULATION_WEIGHTS } from "@/lib/simulations/elo";

export async function getMatches() {
  const [matches, teams] = await Promise.all([getMatchesSource(), getTeamsSource()]);
  const teamMap = new Map(teams.map((team) => [team.id, team]));

  return [...matches].sort((left, right) => left.kickoff.localeCompare(right.kickoff)).map((match) => {
    const homeTeam = teamMap.get(match.homeTeamId);
    const awayTeam = teamMap.get(match.awayTeamId);

    if (!homeTeam || !awayTeam) {
      return match;
    }

    const isUpcoming = match.status === "UPCOMING";

    return {
      ...match,
      winProbability: isUpcoming ? calculateMatchWinProbability(homeTeam, awayTeam, DEFAULT_SIMULATION_WEIGHTS) : match.winProbability,
      homeStats: isUpcoming ? buildProjectedStatLine(homeTeam, awayTeam, true, DEFAULT_SIMULATION_WEIGHTS) : match.homeStats,
      awayStats: isUpcoming ? buildProjectedStatLine(awayTeam, homeTeam, false, DEFAULT_SIMULATION_WEIGHTS) : match.awayStats,
      momentum: isUpcoming ? buildProjectedMomentum(homeTeam, awayTeam, DEFAULT_SIMULATION_WEIGHTS) : match.momentum,
    };
  });
}

export async function getFeaturedMatches() {
  const matches = await getMatches();
  return matches.filter((match) => match.featured);
}

export async function getLiveMatches() {
  const matches = await getMatches();
  return matches.filter((match) => match.status === "LIVE");
}

export async function getUpcomingMatches() {
  const matches = await getMatches();
  return matches.filter((match) => match.status === "UPCOMING");
}

export async function getMatchBySlug(matchId: string) {
  const [matches, events] = await Promise.all([getMatches(), getEventsSource()]);
  const match = matches.find((entry) => entry.slug === matchId || entry.id === matchId) ?? null;

  if (!match) {
    return null;
  }

  return {
    ...match,
    events: events.filter((event) => event.matchId === match.id).sort((left, right) => left.minute - right.minute),
  };
}

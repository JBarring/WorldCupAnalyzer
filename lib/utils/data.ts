import { clamp } from "@/lib/utils/format";
import type { Match, Team } from "@/types";

export function createTeamMap(teams: Team[]) {
  return new Map(teams.map((team) => [team.id, team]));
}

export function attachTeamsToMatch<T extends Match>(match: T, teamMap: Map<string, Team>) {
  const homeTeam = teamMap.get(match.homeTeamId);
  const awayTeam = teamMap.get(match.awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new Error(`Missing teams for match ${match.id}`);
  }

  return {
    ...match,
    homeTeam,
    awayTeam,
  };
}

export function buildProbabilityTimeline(match: Match) {
  return match.momentum.map((point) => {
    const swing = (point.home - point.away) * 18;
    const scoreSwing = (match.score.home - match.score.away) * 3.5;
    const home = clamp(match.winProbability.home + swing + scoreSwing, 8, 86);
    const away = clamp(match.winProbability.away - swing - scoreSwing, 8, 86);
    const draw = clamp(100 - home - away, 4, 42);
    const normalizedTotal = home + away + draw;

    return {
      minute: point.minute,
      home: Number(((home / normalizedTotal) * 100).toFixed(1)),
      draw: Number(((draw / normalizedTotal) * 100).toFixed(1)),
      away: Number(((away / normalizedTotal) * 100).toFixed(1)),
    };
  });
}

export function averageForm(team: Team) {
  const scoreMap = { W: 3, D: 1, L: 0 };
  return team.form.reduce((total, result) => total + scoreMap[result], 0) / team.form.length;
}

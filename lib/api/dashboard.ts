import { getFeaturedMatches, getMatches, getUpcomingMatches } from "@/lib/api/matches";
import { getPredictionSnapshot } from "@/lib/api/predictions";
import { getTeamsSource } from "@/lib/api/data-source";

export async function getDashboardSnapshot() {
  const [featuredMatches, matches, upcomingMatches, teams, predictionSnapshot] = await Promise.all([
    getFeaturedMatches(),
    getMatches(),
    getUpcomingMatches(),
    getTeamsSource(),
    getPredictionSnapshot(3000),
  ]);

  const topTeams = predictionSnapshot.teamOdds.slice(0, 8);

  return {
    matches,
    featuredMatches,
    upcomingMatches,
    topTeams,
    predictionSnapshot,
    summary: {
      scheduledMatches: matches.length,
      upcomingMatches: upcomingMatches.length,
      projectedChampion: predictionSnapshot.championTeamId,
      confirmedTeams: teams.length,
      mostLikelyFinal: predictionSnapshot.finalMatchup,
    },
  };
}

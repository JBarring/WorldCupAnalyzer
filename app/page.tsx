import { Activity, BarChart3, Target, Trophy } from "lucide-react";

import { HeroSection } from "@/components/hero-section";
import { LiveTicker } from "@/components/live-ticker";
import { MatchCard } from "@/components/match-card";
import { PageShell } from "@/components/page-shell";
import { StatsCard } from "@/components/stats-card";
import { PowerRankingsChart } from "@/components/charts/power-rankings-chart";
import { TournamentSummary } from "@/components/tournament-summary";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getDashboardSnapshot, getTeams } from "@/lib/api";
import { attachTeamsToMatch, createTeamMap } from "@/lib/utils/data";

export default async function HomePage() {
  const [dashboard, teams] = await Promise.all([getDashboardSnapshot(), getTeams()]);
  const teamMap = createTeamMap(teams);
  const featuredMatches = dashboard.featuredMatches.map((match) => attachTeamsToMatch(match, teamMap));
  const champion = teamMap.get(dashboard.summary.projectedChampion);
  const finalHome = teamMap.get(dashboard.summary.mostLikelyFinal.homeTeamId);
  const finalAway = teamMap.get(dashboard.summary.mostLikelyFinal.awayTeamId);

  if (!champion || !finalHome || !finalAway || !featuredMatches.length) {
    return null;
  }

  return (
    <PageShell className="space-y-10">
      <HeroSection
        featuredMatch={featuredMatches[0]}
        projectedChampion={champion}
        finalProbability={dashboard.summary.mostLikelyFinal.probability}
      />

      <Reveal>
        <LiveTicker matches={featuredMatches} />
      </Reveal>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Upcoming Matches"
          value={String(dashboard.summary.upcomingMatches)}
          description="Officially scheduled group-stage fixtures in the current local snapshot."
          icon={Activity}
        />
        <StatsCard
          label="Group Matches"
          value={String(dashboard.summary.scheduledMatches)}
          description="Confirmed group-stage matches imported from the 2026 schedule."
          icon={Target}
        />
        <StatsCard
          label="Confirmed Teams"
          value={String(dashboard.summary.confirmedTeams)}
          description="National teams loaded from the current 48-team tournament field."
          icon={Trophy}
        />
        <StatsCard
          label="Simulation Runs"
          value={dashboard.predictionSnapshot.iterations.toLocaleString()}
          description="Monte Carlo passes backing the current probability snapshot."
          icon={BarChart3}
        />
      </section>

      <Reveal delay={0.06}>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Featured Fixtures"
            title="Official Match Center"
            description="Curated flagship fixtures from the imported 2026 schedule, layered with predictive edges and polished match-center navigation."
          />
          <div className="grid gap-5 xl:grid-cols-2">
            {featuredMatches.slice(0, 6).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Tournament Snapshot"
            title="Where The Bracket Is Leaning"
            description="A concise broadcast-style read on the current title race, qualification picture, and likely final matchup."
          />
          <TournamentSummary
            projectedChampion={champion}
            likelyFinalHome={finalHome}
            likelyFinalAway={finalAway}
            finalProbability={dashboard.summary.mostLikelyFinal.probability}
            confirmedTeams={dashboard.summary.confirmedTeams}
            scheduledMatches={dashboard.summary.scheduledMatches}
          />
        </section>
      </Reveal>

      <Reveal delay={0.14}>
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Top Teams"
            title="Championship Probability Board"
            description="The top of the field by power rating and tournament win share, refreshed through the simulation engine."
          />
          <PowerRankingsChart
            data={dashboard.topTeams.map((entry) => ({
              name: teamMap.get(entry.teamId)?.code ?? entry.teamId,
              powerRating: entry.powerRating,
              tournamentWinPct: entry.tournamentWinPct,
            }))}
          />
        </section>
      </Reveal>
    </PageShell>
  );
}

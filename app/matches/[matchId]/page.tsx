import { notFound } from "next/navigation";

import { ComparisonBars } from "@/components/comparison-bars";
import { EventTimeline } from "@/components/event-timeline";
import { PageShell } from "@/components/page-shell";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import { MomentumChart } from "@/components/charts/momentum-chart";
import { PossessionChart } from "@/components/charts/possession-chart";
import { ProbabilityAreaChart } from "@/components/charts/probability-area-chart";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Pill } from "@/components/ui/pill";
import { getMatchBySlug, getTeams } from "@/lib/api";
import { buildComparisonStats } from "@/lib/utils/tournament";
import { buildProbabilityTimeline, createTeamMap } from "@/lib/utils/data";
import { formatMatchTime } from "@/lib/utils/format";

export default async function MatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const [match, teams] = await Promise.all([getMatchBySlug(matchId), getTeams()]);

  if (!match) {
    notFound();
  }

  const teamMap = createTeamMap(teams);
  const homeTeam = teamMap.get(match.homeTeamId);
  const awayTeam = teamMap.get(match.awayTeamId);

  if (!homeTeam || !awayTeam) {
    notFound();
  }

  const probabilityTimeline = buildProbabilityTimeline(match);
  const hydratedMatch = {
    ...match,
    homeTeam,
    awayTeam,
  };

  return (
    <PageShell className="space-y-8 pt-8">
      <GlassPanel className="overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Pill>{match.group ? `Group ${match.group}` : match.roundLabel}</Pill>
              <Pill className={match.status === "LIVE" ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-200" : ""}>
                {match.status === "LIVE" ? `${match.minute}' live` : match.status.toLowerCase()}
              </Pill>
            </div>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <TeamLink team={homeTeam} className="flex items-center gap-4">
                <TeamCrest team={homeTeam} size="lg" showFlag />
                <div>
                  <p className="text-3xl font-semibold text-white group-hover/team:text-emerald-200">{homeTeam.name}</p>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/44">Win probability {match.winProbability.home.toFixed(1)}%</p>
                </div>
              </TeamLink>
              <div className="text-center">
                <p className="font-[family:var(--font-display)] text-6xl uppercase tracking-[0.08em] text-white">
                  {match.score.home} - {match.score.away}
                </p>
                <p className="text-sm text-white/54">{formatMatchTime(match.kickoff)}</p>
              </div>
              <TeamLink team={awayTeam} className="flex items-center gap-4 md:flex-row-reverse">
                <TeamCrest team={awayTeam} size="lg" showFlag />
                <div className="md:text-right">
                  <p className="text-3xl font-semibold text-white group-hover/team:text-emerald-200">{awayTeam.name}</p>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/44">Win probability {match.winProbability.away.toFixed(1)}%</p>
                </div>
              </TeamLink>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/42">Venue</p>
                  <p className="mt-2 font-semibold text-white">{match.venue}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/42">Expected Goals</p>
                  <p className="mt-2 font-semibold text-white">
                    {match.homeStats.xg.toFixed(2)} - {match.awayStats.xg.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/42">Shots On Target</p>
                  <p className="mt-2 font-semibold text-white">
                    {match.homeStats.shotsOnTarget} - {match.awayStats.shotsOnTarget}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-1">
            <GlassPanel className="p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Home Win</p>
              <p className="mt-2 font-[family:var(--font-display)] text-5xl uppercase tracking-[0.04em] text-white">{match.winProbability.home.toFixed(1)}%</p>
            </GlassPanel>
            <GlassPanel className="p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Draw</p>
              <p className="mt-2 font-[family:var(--font-display)] text-5xl uppercase tracking-[0.04em] text-white">{match.winProbability.draw.toFixed(1)}%</p>
            </GlassPanel>
            <GlassPanel className="p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">Away Win</p>
              <p className="mt-2 font-[family:var(--font-display)] text-5xl uppercase tracking-[0.04em] text-white">{match.winProbability.away.toFixed(1)}%</p>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <MomentumChart match={hydratedMatch} />
        <ProbabilityAreaChart data={probabilityTimeline} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <PossessionChart home={match.homeStats.possession} away={match.awayStats.possession} />
        <ComparisonBars stats={buildComparisonStats(match)} />
      </div>

      <EventTimeline events={match.events ?? []} teamMap={teamMap} />
    </PageShell>
  );
}

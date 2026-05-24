import { notFound } from "next/navigation";

import { MatchCard } from "@/components/match-card";
import { PageShell } from "@/components/page-shell";
import { TeamCrest } from "@/components/team-crest";
import { TeamResultsChart } from "@/components/charts/team-results-chart";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Pill } from "@/components/ui/pill";
import { getTeamProfileSnapshot, getTeams } from "@/lib/api";
import { createTeamMap } from "@/lib/utils/data";
import { formatCompactDate } from "@/lib/utils/format";

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const [snapshot, teams] = await Promise.all([getTeamProfileSnapshot(teamId), getTeams()]);

  if (!snapshot) {
    notFound();
  }

  const teamMap = createTeamMap(teams);
  const { team, profile, tournamentMatches } = snapshot;

  return (
    <PageShell className="space-y-8 pt-8">
      <GlassPanel className="overflow-hidden p-6 md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Pill>Group {team.group}</Pill>
              <Pill>{team.confederation}</Pill>
              <Pill>Captain {profile.captain}</Pill>
            </div>

            <div className="flex items-center gap-5">
              <TeamCrest team={team} size="lg" showFlag />
              <div className="space-y-2">
                <h1 className="font-[family:var(--font-display)] text-5xl uppercase tracking-[0.04em] text-white md:text-6xl">{team.name}</h1>
                <p className="max-w-3xl text-sm leading-8 text-white/66 md:text-base">{profile.overview}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Preferred Shape</p>
                <p className="mt-2 font-[family:var(--font-display)] text-3xl uppercase tracking-[0.05em] text-white">{profile.preferredFormation}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">FIFA Rank</p>
                <p className="mt-2 font-[family:var(--font-display)] text-3xl uppercase tracking-[0.05em] text-white">#{team.fifaRank}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">Elo Rating</p>
                <p className="mt-2 font-[family:var(--font-display)] text-3xl uppercase tracking-[0.05em] text-white">{team.eloRating}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <GlassPanel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Tactical Identity</p>
              <p className="mt-3 text-sm leading-7 text-white/64">{profile.styleLabel}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 bg-white/4 p-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">Primary</span>
                  <p className="mt-2 font-semibold text-white">{profile.preferredFormation}</p>
                </div>
                <div className="rounded-[18px] border border-white/10 bg-white/4 p-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">Secondary</span>
                  <p className="mt-2 font-semibold text-white">{profile.alternateFormation}</p>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Key Players</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {profile.keyPlayers.map((player) => (
                  <span key={player} className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/78">
                    {player}
                  </span>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Strength Profile</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {profile.strengths.map((strength) => (
                  <span key={strength} className="rounded-full border border-emerald-400/16 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                    {strength}
                  </span>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <TeamResultsChart team={team} results={profile.recentResults} teamMap={teamMap} />

        <GlassPanel className="p-6">
          <div className="mb-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Recent Form Proxy</p>
            <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Scouting Form Log</p>
          </div>
          <div className="space-y-3">
            {profile.recentResults.map((result) => {
              const opponent = teamMap.get(result.opponentTeamId);
              return (
                <div key={`${result.date}-${result.opponentTeamId}`} className="grid gap-2 rounded-[20px] border border-white/8 bg-white/5 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/40">{formatCompactDate(result.date)}</div>
                  <div className="text-sm text-white/66">
                    <span className="font-semibold text-white">{result.competition}</span>
                    <span className="mx-2 text-white/30">•</span>
                    <span>{result.venue}</span>
                    <span className="mx-2 text-white/30">•</span>
                    <span>vs {opponent?.name ?? result.opponentTeamId}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                        result.result === "W"
                          ? "bg-emerald-400/12 text-emerald-100"
                          : result.result === "D"
                            ? "bg-amber-300/12 text-amber-100"
                            : "bg-rose-400/12 text-rose-100"
                      }`}
                    >
                      {result.result}
                    </span>
                    <span className="font-[family:var(--font-display)] text-2xl uppercase tracking-[0.04em] text-white">
                      {result.goalsFor}-{result.goalsAgainst}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Current Tournament Matches</p>
          <p className="font-[family:var(--font-display)] text-4xl uppercase tracking-[0.04em] text-white">World Cup Match Log</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {tournamentMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}

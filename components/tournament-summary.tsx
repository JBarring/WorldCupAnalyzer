import { Sparkles, Swords, Trophy } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import { formatPercent } from "@/lib/utils/format";
import type { Team } from "@/types";

interface TournamentSummaryProps {
  projectedChampion: Team;
  likelyFinalHome: Team;
  likelyFinalAway: Team;
  finalProbability: number;
  confirmedTeams: number;
  scheduledMatches: number;
}

export function TournamentSummary({
  projectedChampion,
  likelyFinalHome,
  likelyFinalAway,
  finalProbability,
  confirmedTeams,
  scheduledMatches,
}: TournamentSummaryProps) {
  return (
    <GlassPanel className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/12 text-emerald-200">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/42">Tournament Pulse</p>
            <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Model-Leading Champion</p>
          </div>
        </div>

        <TeamLink team={projectedChampion} className="flex items-center gap-4">
          <TeamCrest team={projectedChampion} size="lg" showFlag />
          <div>
            <p className="text-3xl font-semibold text-white group-hover/team:text-emerald-200">{projectedChampion.name}</p>
            <p className="mt-1 max-w-xl text-sm leading-7 text-white/62">
              The blended model still likes {projectedChampion.shortName} most thanks to elite strength signals, strong recent form inputs, and a projected bracket path that avoids too many early coin-flips.
            </p>
          </div>
        </TeamLink>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
            <Swords className="h-4 w-4" />
            Most Likely Final
          </div>
          <div className="flex items-center gap-3">
            <TeamCrest team={likelyFinalHome} size="sm" showFlag />
            <span className="text-sm font-semibold text-white">{likelyFinalHome.code}</span>
            <span className="text-white/40">vs</span>
            <span className="text-sm font-semibold text-white">{likelyFinalAway.code}</span>
            <TeamCrest team={likelyFinalAway} size="sm" showFlag />
          </div>
          <p className="mt-2 text-sm text-white/60">{formatPercent(finalProbability, 1)} of sims end here.</p>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
            <Sparkles className="h-4 w-4" />
            Tournament State
          </div>
          <div className="space-y-2 text-sm text-white/64">
            <p>{confirmedTeams} teams are locked into the current tournament snapshot.</p>
            <p>{scheduledMatches} group matches are on the imported official schedule.</p>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

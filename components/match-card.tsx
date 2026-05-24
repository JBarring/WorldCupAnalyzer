import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Pill } from "@/components/ui/pill";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import { formatMatchTime } from "@/lib/utils/format";
import { getStageLabel } from "@/lib/utils/tournament";
import type { HydratedMatch } from "@/types";

interface MatchCardProps {
  match: HydratedMatch;
}

export function MatchCard({ match }: MatchCardProps) {
  const statusLabel = match.status === "LIVE" ? `${match.minute}'` : match.status === "FINAL" ? "Final" : "Upcoming";

  return (
    <GlassPanel className="group h-full p-5 transition duration-300 hover:-translate-y-1 hover:border-white/16 hover:bg-white/8">
      <div className="flex items-center justify-between gap-4">
        <Pill className={match.status === "LIVE" ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-200" : ""}>
          {getStageLabel(match)}
        </Pill>
        <Link href={`/matches/${match.slug}`} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/48 hover:text-white">
          <span>{statusLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TeamLink team={match.homeTeam} className="flex items-center gap-3">
            <TeamCrest team={match.homeTeam} size="sm" showFlag />
            <div>
              <p className="font-semibold text-white group-hover/team:text-emerald-200">{match.homeTeam.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">{match.homeTeam.code}</p>
            </div>
          </TeamLink>
          <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.08em] text-white">{match.score.home}</p>
        </div>

        <div className="h-px bg-white/8" />

        <div className="flex items-center justify-between gap-4">
          <TeamLink team={match.awayTeam} className="flex items-center gap-3">
            <TeamCrest team={match.awayTeam} size="sm" showFlag />
            <div>
              <p className="font-semibold text-white group-hover/team:text-emerald-200">{match.awayTeam.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/40">{match.awayTeam.code}</p>
            </div>
          </TeamLink>
          <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.08em] text-white">{match.score.away}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-white/54 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-white/35" />
          <span>{formatMatchTime(match.kickoff)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-white/35" />
          <span>{match.city}</span>
        </div>
      </div>
    </GlassPanel>
  );
}

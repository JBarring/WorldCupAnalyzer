import Link from "next/link";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import { Pill } from "@/components/ui/pill";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import { formatPercent } from "@/lib/utils/format";
import type { HydratedMatch, Team } from "@/types";

interface HeroSectionProps {
  featuredMatch: HydratedMatch;
  projectedChampion: Team;
  finalProbability: number;
}

export function HeroSection({ featuredMatch, projectedChampion, finalProbability }: HeroSectionProps) {
  return (
    <section className="grid gap-6 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
      <GlassPanel className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(40,184,255,0.22),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(74,222,182,0.16),transparent_30%),linear-gradient(145deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <Pill className="border-emerald-400/18 bg-emerald-400/10 text-emerald-200">2026 Tournament Command Center</Pill>
            <div className="space-y-4">
              <h1 className="max-w-4xl font-[family:var(--font-display)] text-5xl uppercase leading-[0.92] tracking-[0.04em] text-white md:text-7xl">
                World Cup Intelligence with Broadcast-Level Storytelling
              </h1>
              <p className="max-w-2xl text-sm leading-8 text-white/68 md:text-base">
                Official 2026 teams and fixtures, matchup win curves, Monte Carlo bracket runs, and premium visual explainers in one modern match center.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#4adeb6,#28b8ff)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(40,184,255,0.32)] transition hover:scale-[1.02]"
            >
              Explore Match Center
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/predictions" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12">
              Run Tournament Sims
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/7 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Projected Champion</span>
              <TeamLink team={projectedChampion} className="mt-3 flex items-center gap-3">
                <TeamCrest team={projectedChampion} size="sm" showFlag />
                <div>
                  <p className="font-semibold text-white group-hover/team:text-emerald-200">{projectedChampion.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">{projectedChampion.code}</p>
                </div>
              </TeamLink>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Model Favorite Final</span>
              <p className="mt-4 font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">{formatPercent(finalProbability, 1)}</p>
              <p className="mt-1 text-sm text-white/56">Most likely final matchup frequency across current sims.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/7 p-4">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">Simulation Inputs</span>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/62">
                <BarChart3 className="h-4 w-4 text-emerald-200" />
                Elo, FIFA rank, form, GD, neutral-site compression
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6 md:p-8">
        <div className="space-y-4">
          <Pill className="border-white/12 bg-white/8 text-white/70">Featured Match</Pill>
          <div className="space-y-1">
            <p className="font-[family:var(--font-display)] text-4xl uppercase tracking-[0.04em] text-white">{featuredMatch.homeTeam.code} vs {featuredMatch.awayTeam.code}</p>
            <p className="text-sm text-white/56">{featuredMatch.city} • {featuredMatch.venue}</p>
          </div>
        </div>
          <div className="mt-8 grid gap-4">
          <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 p-4">
            <TeamLink team={featuredMatch.homeTeam} className="flex items-center gap-3">
              <TeamCrest team={featuredMatch.homeTeam} size="sm" showFlag />
              <div>
                <p className="font-semibold text-white group-hover/team:text-emerald-200">{featuredMatch.homeTeam.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Win {formatPercent(featuredMatch.winProbability.home)}</p>
              </div>
            </TeamLink>
            <span className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.06em] text-white">{featuredMatch.score.home}</span>
          </div>
          <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 p-4">
            <TeamLink team={featuredMatch.awayTeam} className="flex items-center gap-3">
              <TeamCrest team={featuredMatch.awayTeam} size="sm" showFlag />
              <div>
                <p className="font-semibold text-white group-hover/team:text-emerald-200">{featuredMatch.awayTeam.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/40">Win {formatPercent(featuredMatch.winProbability.away)}</p>
              </div>
            </TeamLink>
            <span className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.06em] text-white">{featuredMatch.score.away}</span>
          </div>
          <div className="rounded-[24px] border border-emerald-400/18 bg-emerald-400/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Model Read</p>
            <p className="mt-2 text-sm leading-7 text-emerald-50/88">
              This is a pre-tournament projection, so the scoreline is still 0-0. The edge below comes from the model inputs, not live match events.
            </p>
          </div>
        </div>
      </GlassPanel>
    </section>
  );
}

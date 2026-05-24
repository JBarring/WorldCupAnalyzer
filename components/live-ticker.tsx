"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import type { HydratedMatch } from "@/types";

interface LiveTickerProps {
  matches: HydratedMatch[];
}

export function LiveTicker({ matches }: LiveTickerProps) {
  const liveMatches = useMemo(() => matches.filter((match) => match.status === "LIVE"), [matches]);
  const upcomingMatches = useMemo(() => matches.filter((match) => match.status === "UPCOMING").slice(0, 6), [matches]);
  const [index, setIndex] = useState(0);
  const rotationMatches = liveMatches.length ? liveMatches : upcomingMatches;

  useEffect(() => {
    if (rotationMatches.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % rotationMatches.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [rotationMatches.length]);

  if (!rotationMatches.length) {
    return null;
  }

  const match = rotationMatches[index];
  const isLive = match.status === "LIVE";

  return (
    <GlassPanel className="overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isLive ? (
            <span className="relative inline-flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
            </span>
          ) : (
            <span className="inline-flex h-3 w-3 rounded-full bg-sky-300" />
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">{isLive ? "Live Match Pulse" : "Upcoming Fixture Tracker"}</p>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/44">
          {index + 1} / {rotationMatches.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={match.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35 }}
          className="grid gap-4 md:grid-cols-[1fr_auto_1fr]"
        >
          <TeamLink team={match.homeTeam} className="flex items-center gap-3">
            <TeamCrest team={match.homeTeam} size="sm" showFlag />
            <div>
              <p className="font-semibold text-white group-hover/team:text-emerald-200">{match.homeTeam.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/42">{match.group ? `Group ${match.group}` : match.roundLabel}</p>
            </div>
          </TeamLink>
          <div className="flex items-center justify-center gap-3 text-center">
            <div>
              <p className="font-[family:var(--font-display)] text-4xl uppercase tracking-[0.06em] text-white">
                {match.score.home} - {match.score.away}
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">{isLive ? `${match.minute}'` : "Pregame"}</p>
            </div>
          </div>
          <TeamLink team={match.awayTeam} className="flex items-center justify-end gap-3">
            <div className="text-right">
              <p className="font-semibold text-white group-hover/team:text-emerald-200">{match.awayTeam.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/42">{match.city}</p>
            </div>
            <TeamCrest team={match.awayTeam} size="sm" showFlag />
          </TeamLink>
        </motion.div>
      </AnimatePresence>
    </GlassPanel>
  );
}

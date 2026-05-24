import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamCrest } from "@/components/team-crest";
import type { MatchEvent, Team } from "@/types";

interface EventTimelineProps {
  events: MatchEvent[];
  teamMap: Map<string, Team>;
}

export function EventTimeline({ events, teamMap }: EventTimelineProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-5 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Match Timeline</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Key Events</p>
      </div>
      <div className="space-y-4">
        {events.length ? (
          events.map((event) => {
            const team = teamMap.get(event.teamId);
            return (
              <div key={event.id} className="flex gap-4 rounded-[22px] border border-white/8 bg-white/5 p-4">
                <div className="min-w-12 text-center">
                  <p className="font-[family:var(--font-display)] text-2xl uppercase tracking-[0.04em] text-white">{event.minute}&apos;</p>
                </div>
                <div className="flex flex-1 items-start gap-3">
                  {team ? <TeamCrest team={team} size="sm" showFlag /> : null}
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {event.label} <span className="text-white/44">• {event.player}</span>
                    </p>
                    <p className="text-sm leading-6 text-white/60">{event.detail}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/12 bg-white/4 p-6 text-sm leading-7 text-white/58">
            Timeline data will populate here once the live feed adapter is connected. The page is already structured to accept event streams from websockets or provider APIs later.
          </div>
        )}
      </div>
    </GlassPanel>
  );
}

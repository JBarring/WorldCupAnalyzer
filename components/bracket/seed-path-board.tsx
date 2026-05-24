import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import { describeKnockoutSlot } from "@/lib/utils/tournament";
import type { BracketFixture, Team } from "@/types";

interface SeedPathBoardProps {
  fixtures: BracketFixture[];
  teamMap: Map<string, Team>;
}

export function SeedPathBoard({ fixtures, teamMap }: SeedPathBoardProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Knockout Seeding</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">Projected Round of 32 Path</p>
        <p className="max-w-3xl text-sm leading-7 text-white/60">
          This is the actual 2026 first knockout round shape. Group winners, runners-up, and the best third-place teams are slotted into the official path and then advanced one match at a time.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {fixtures.map((fixture, index) => {
          const homeTeam = teamMap.get(fixture.homeTeamId);
          const awayTeam = teamMap.get(fixture.awayTeamId);

          if (!homeTeam || !awayTeam) {
            return null;
          }

          return (
            <div key={fixture.id} className="rounded-[22px] border border-white/8 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/42">Round of 32 #{index + 1}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/42">
                  {fixture.homeSeedLabel} vs {fixture.awaySeedLabel}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { team: homeTeam, seedLabel: fixture.homeSeedLabel },
                  { team: awayTeam, seedLabel: fixture.awaySeedLabel },
                ].map(({ team, seedLabel }) => (
                  <TeamLink key={`${fixture.id}-${team.id}`} team={team} className="rounded-[18px] border border-white/8 bg-white/4 p-3 hover:bg-white/8">
                    <div className="flex items-center gap-3">
                      <TeamCrest team={team} size="sm" showFlag />
                      <div>
                        <p className="font-semibold text-white group-hover/team:text-emerald-200">{team.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/40">{describeKnockoutSlot(seedLabel)}</p>
                      </div>
                    </div>
                  </TeamLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

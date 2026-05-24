import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import type { GroupStanding, ProjectedGroupStanding, Team } from "@/types";

interface GroupTableProps {
  group: string;
  standings: Array<GroupStanding | ProjectedGroupStanding>;
  teamMap: Map<string, Team>;
  presentation?: "projection" | "results";
}

export function GroupTable({ group, standings, teamMap, presentation = "projection" }: GroupTableProps) {
  return (
    <GlassPanel className="overflow-hidden">
      <div className="border-b border-white/8 px-5 py-4">
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.06em] text-white">Group {group}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">
          {presentation === "projection"
            ? "Pre-kickoff forecast board: expected points and advancement odds, not completed results"
            : "Live standings table"}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.24em] text-white/42">
              <th className="px-5 py-4">Team</th>
              {presentation === "projection" ? (
                <>
                  <th className="px-3 py-4">Win Group</th>
                  <th className="px-3 py-4">Advance</th>
                  <th className="px-3 py-4">Exp GD</th>
                  <th className="px-5 py-4 text-right">Exp Pts</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-4">W</th>
                  <th className="px-3 py-4">D</th>
                  <th className="px-3 py-4">L</th>
                  <th className="px-3 py-4">GD</th>
                  <th className="px-3 py-4">Adv</th>
                  <th className="px-5 py-4 text-right">Pts</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const team = teamMap.get(standing.teamId);
              const projectedStanding = standing as ProjectedGroupStanding;

              if (!team) {
                return null;
              }

              const emphasis =
                standing.qualificationStatus === "qualified"
                  ? "bg-emerald-400/10"
                  : standing.qualificationStatus === "alive"
                    ? "bg-white/2"
                    : "bg-transparent";

              return (
                <tr key={standing.teamId} className={emphasis}>
                  <td className="px-5 py-4">
                    <TeamLink team={team} className="flex items-center gap-3">
                      <span className="w-4 text-xs font-semibold text-white/44">{index + 1}</span>
                      <TeamCrest team={team} size="sm" showFlag />
                      <div>
                        <p className="font-semibold text-white group-hover/team:text-emerald-200">{team.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                          {projectedStanding.finishFirstPct ? `${projectedStanding.finishFirstPct.toFixed(1)}% win group` : standing.qualificationStatus}
                        </p>
                      </div>
                    </TeamLink>
                  </td>
                  {presentation === "projection" ? (
                    <>
                      <td className="px-3 py-4 text-sm font-semibold text-white">
                        {projectedStanding.finishFirstPct ? `${projectedStanding.finishFirstPct.toFixed(1)}%` : "0%"}
                      </td>
                      <td className="px-3 py-4 text-sm font-semibold text-white">
                        {projectedStanding.advancePct ? `${projectedStanding.advancePct.toFixed(1)}%` : "0%"}
                      </td>
                      <td className="px-3 py-4 text-sm text-white/68">
                        {projectedStanding.projectedGoalDifference
                          ? `${projectedStanding.projectedGoalDifference > 0 ? "+" : ""}${projectedStanding.projectedGoalDifference.toFixed(1)}`
                          : standing.goalDifference > 0
                            ? `+${standing.goalDifference}`
                            : standing.goalDifference}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-white">
                        {projectedStanding.projectedPoints ? projectedStanding.projectedPoints.toFixed(1) : standing.points}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-4 text-sm text-white/68">{standing.won}</td>
                      <td className="px-3 py-4 text-sm text-white/68">{standing.drawn}</td>
                      <td className="px-3 py-4 text-sm text-white/68">{standing.lost}</td>
                      <td className="px-3 py-4 text-sm text-white/68">
                        {projectedStanding.projectedGoalDifference
                          ? `${projectedStanding.projectedGoalDifference > 0 ? "+" : ""}${projectedStanding.projectedGoalDifference.toFixed(1)}`
                          : standing.goalDifference > 0
                            ? `+${standing.goalDifference}`
                            : standing.goalDifference}
                      </td>
                      <td className="px-3 py-4 text-sm font-semibold text-white">{projectedStanding.advancePct ? `${projectedStanding.advancePct.toFixed(1)}%` : "0%"}</td>
                      <td className="px-5 py-4 text-right font-semibold text-white">
                        {projectedStanding.projectedPoints ? projectedStanding.projectedPoints.toFixed(1) : standing.points}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassPanel>
  );
}

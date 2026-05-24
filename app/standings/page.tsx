import { GroupTable } from "@/components/group-table";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getStandingsByGroup, getTeams } from "@/lib/api";
import { createTeamMap } from "@/lib/utils/data";

export default async function StandingsPage() {
  const [standingsByGroup, teams] = await Promise.all([getStandingsByGroup(), getTeams()]);
  const teamMap = createTeamMap(teams);

  return (
    <PageShell className="space-y-8 pt-8">
      <Reveal>
        <SectionHeading
          eyebrow="Group Tables"
          title="Qualification Picture"
          description="Before kickoff this view is a forecast board, not a live table. It shows expected points, projected goal difference, and advancement odds from the current 2026 simulation."
        />
      </Reveal>
      <div className="grid gap-5 xl:grid-cols-2">
        {Object.entries(standingsByGroup).map(([group, standings], index) => (
          <Reveal key={group} delay={index * 0.03}>
            <GroupTable group={group} standings={standings} teamMap={teamMap} />
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}

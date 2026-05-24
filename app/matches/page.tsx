import { MatchesBoard } from "@/components/matches-board";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMatches, getTeams } from "@/lib/api";
import { attachTeamsToMatch, createTeamMap } from "@/lib/utils/data";

export default async function MatchesPage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()]);
  const teamMap = createTeamMap(teams);
  const hydratedMatches = matches.map((match) => attachTeamsToMatch(match, teamMap));

  return (
    <PageShell className="space-y-8 pt-8">
      <Reveal>
        <SectionHeading
          eyebrow="All Fixtures"
          title="Match Center"
          description="A premium slate view for the official 2026 group-stage schedule, with projected win probabilities, expected stat profiles, and one-click drilldowns."
        />
      </Reveal>
      <Reveal delay={0.08}>
        <MatchesBoard matches={hydratedMatches} />
      </Reveal>
    </PageShell>
  );
}

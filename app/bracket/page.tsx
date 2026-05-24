import { BracketExperience } from "@/components/bracket/bracket-experience";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getMatches, getPredictionSnapshot, getTeams } from "@/lib/api";

export default async function BracketPage() {
  const [teams, matches, initialSummary] = await Promise.all([
    getTeams(),
    getMatches(),
    getPredictionSnapshot(3500),
  ]);

  return (
    <PageShell className="space-y-8 pt-8">
      <Reveal>
        <SectionHeading
          eyebrow="Bracket Center"
          title="Forecast Bracket"
          description="One forecast hub for the 2026 tournament: projected group tables, a true knockout bracket, clickable model explanations, and manual upset overrides that immediately reshape the path ahead."
        />
      </Reveal>
      <Reveal delay={0.1}>
        <BracketExperience teams={teams} matches={matches} initialSummary={initialSummary} />
      </Reveal>
    </PageShell>
  );
}

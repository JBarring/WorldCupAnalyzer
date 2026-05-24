import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamLink } from "@/components/team-link";
import { TeamCrest } from "@/components/team-crest";
import type { BracketFixture, Team } from "@/types";

interface ProjectedBracketTableProps {
  bracket: Record<string, BracketFixture[]>;
  teamMap: Map<string, Team>;
  title?: string;
  description?: string;
  overrides?: Record<string, string>;
  showOverrideControls?: boolean;
  onOverride?: (fixtureId: string, winnerTeamId?: string) => void;
  selectedFixtureId?: string;
  onSelectFixture?: (fixtureId: string) => void;
}

const roundOrder = ["ROUND_OF_32", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"] as const;

export function ProjectedBracketTable({
  bracket,
  teamMap,
  title = "Projected Winners Table",
  description = "Each row shows the current model winner for that fixture and the corresponding match win share.",
  overrides = {},
  showOverrideControls = false,
  onOverride,
  selectedFixtureId,
  onSelectFixture,
}: ProjectedBracketTableProps) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/44">Projected Bracket</p>
        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">{title}</p>
        <p className="max-w-3xl text-sm leading-7 text-white/60">{description}</p>
      </div>

      <div className="space-y-6">
        {roundOrder.map((round) => {
          const fixtures = bracket[round] ?? [];
          if (!fixtures.length) return null;

          return (
            <div key={round} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/54">
                {round === "ROUND_OF_32"
                  ? "Round of 32"
                  : round === "ROUND_OF_16"
                    ? "Round of 16"
                    : round === "QUARTERFINAL"
                      ? "Quarterfinals"
                      : round === "SEMIFINAL"
                        ? "Semifinals"
                        : "Final"}
              </p>
              <div className="space-y-3">
                {fixtures.map((fixture) => {
                  const homeTeam = teamMap.get(fixture.homeTeamId);
                  const awayTeam = teamMap.get(fixture.awayTeamId);
                  const winner = teamMap.get(fixture.winnerTeamId ?? "");
                  const winnerShare =
                    fixture.winnerTeamId === fixture.homeTeamId ? fixture.homeWinProbability : fixture.awayWinProbability;
                  const overrideWinnerId = overrides[fixture.id];
                  const isOverrideActive = overrideWinnerId === fixture.homeTeamId || overrideWinnerId === fixture.awayTeamId;
                  const isUpsetPick = isOverrideActive && overrideWinnerId !== fixture.explanation?.favoriteTeamId;

                  if (!homeTeam || !awayTeam || !winner) {
                    return null;
                  }

                  return (
                    <div
                      key={fixture.id}
                      role={onSelectFixture ? "button" : undefined}
                      tabIndex={onSelectFixture ? 0 : undefined}
                      onClick={() => onSelectFixture?.(fixture.id)}
                      onKeyDown={(event) => {
                        if (!onSelectFixture) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onSelectFixture(fixture.id);
                        }
                      }}
                      className={`grid gap-3 rounded-[22px] border p-4 transition xl:grid-cols-[1.25fr_1fr_auto] xl:items-center ${
                        selectedFixtureId === fixture.id
                          ? "border-emerald-300/26 bg-emerald-400/8 shadow-[0_18px_60px_rgba(12,130,108,0.2)]"
                          : "border-white/8 bg-white/5"
                      } ${onSelectFixture ? "cursor-pointer hover:bg-white/8" : ""}`}
                    >
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          {fixture.pairingLabel ?? `${homeTeam.code} vs ${awayTeam.code}`}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-white/68">
                          <TeamLink team={homeTeam} className="inline-flex items-center gap-2">
                            <TeamCrest team={homeTeam} size="sm" showFlag />
                            <span className="font-semibold text-white group-hover/team:text-emerald-200">{homeTeam.name}</span>
                          </TeamLink>
                          <span className="text-white/34">vs</span>
                          <TeamLink team={awayTeam} className="inline-flex items-center gap-2">
                            <TeamCrest team={awayTeam} size="sm" showFlag />
                            <span className="font-semibold text-white group-hover/team:text-emerald-200">{awayTeam.name}</span>
                          </TeamLink>
                        </div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/38">
                          {fixture.scheduleMatchId ?? fixture.id} • {fixture.venue ?? "Projected venue"} • {fixture.explanation?.projectedScoreline ?? "1-0"}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-[18px] border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/64">
                          <span className="block text-[11px] uppercase tracking-[0.18em] text-white/40">Projected winner</span>
                          <span className="mt-1 block font-semibold text-white">{winner.name}</span>
                          <span className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-white/42">
                            {isOverrideActive ? (isUpsetPick ? "user upset locked" : "winner pick locked") : "model favorite"}
                          </span>
                        </div>
                        {showOverrideControls && onOverride ? (
                          <div className="flex flex-wrap gap-2">
                            {[
                              { team: homeTeam, active: overrideWinnerId === homeTeam.id },
                              { team: awayTeam, active: overrideWinnerId === awayTeam.id },
                            ].map(({ team, active }) => (
                              <button
                                key={team.id}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onOverride(fixture.id, team.id);
                                }}
                                className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                                  active
                                    ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-100"
                                    : "border-white/10 bg-white/4 text-white/62 hover:bg-white/8"
                                }`}
                              >
                                Pick {team.code}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOverride(fixture.id);
                              }}
                              className="rounded-full border border-white/10 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/48 transition hover:bg-white/6"
                            >
                              Clear Pick
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="text-left xl:text-right">
                        <p className="font-[family:var(--font-display)] text-3xl uppercase tracking-[0.04em] text-white">{winnerShare.toFixed(1)}%</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">match win share</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/38">
                          upset risk {fixture.explanation?.upsetRisk?.toFixed(1) ?? "0.0"}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}

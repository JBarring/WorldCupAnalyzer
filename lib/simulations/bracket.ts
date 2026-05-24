import knockoutTemplatesData from "@/data/knockout.json";
import { buildMatchPredictionBreakdown, calculateKnockoutWinShare, DEFAULT_SIMULATION_WEIGHTS, pickWinner } from "@/lib/simulations/elo";
import type { BracketFixture, KnockoutTemplateFixture, SimulationWeights, Team, WinnerOverride } from "@/types";

export const DISPLAY_BRACKET_ORDER = ["ROUND_OF_32", "ROUND_OF_16", "QUARTERFINAL", "SEMIFINAL", "FINAL"] as const;

const KNOCKOUT_TEMPLATES = knockoutTemplatesData as KnockoutTemplateFixture[];

function templateMatchNumber(templateId: string) {
  return Number(templateId.replace(/\D/g, ""));
}

function buildThirdPlaceAssignment(
  slotLabels: string[],
  qualifiedThirdGroups: string[],
  index = 0,
  assignment: Record<string, string> = {},
  usedGroups = new Set<string>(),
): Record<string, string> | null {
  if (index >= slotLabels.length) {
    return assignment;
  }

  const slotLabel = slotLabels[index];
  const candidates = slotLabel
    .slice(1)
    .split("")
    .filter((group) => qualifiedThirdGroups.includes(group) && !usedGroups.has(group))
    .sort();

  for (const group of candidates) {
    usedGroups.add(group);
    assignment[slotLabel] = group;
    const resolved = buildThirdPlaceAssignment(slotLabels, qualifiedThirdGroups, index + 1, assignment, usedGroups);

    if (resolved) {
      return resolved;
    }

    usedGroups.delete(group);
    delete assignment[slotLabel];
  }

  return null;
}

function resolveThirdPlaceSlots(qualifiedThirdGroups: string[]) {
  const slotLabels = [...new Set(KNOCKOUT_TEMPLATES.flatMap((template) => [template.homeSlot, template.awaySlot]).filter((slot) => /^3[A-L]+$/.test(slot)))].sort(
    (left, right) => left.length - right.length || left.localeCompare(right),
  );

  /**
   * The official 2026 format mixes eight best third-place teams into the
   * Round of 32. We resolve that as a constrained matching problem:
   * each slot accepts only certain group letters, and each third-place group
   * can be used exactly once.
   */
  const assignment = buildThirdPlaceAssignment(slotLabels, qualifiedThirdGroups);

  if (!assignment) {
    throw new Error(`Unable to assign qualified third-place groups for ${qualifiedThirdGroups.join(", ")}`);
  }

  return assignment;
}

function resolveSeedSlot(slot: string, seedMap: Record<string, string>) {
  const match = slot.match(/^([123])([A-L])$/);
  if (!match) {
    return null;
  }

  const [, position, group] = match;
  return seedMap[`${group}${position}`] ?? null;
}

function resolveFixtureSlot({
  slot,
  seedMap,
  thirdPlaceAssignment,
  winnersMap,
  losersMap,
}: {
  slot: string;
  seedMap: Record<string, string>;
  thirdPlaceAssignment: Record<string, string>;
  winnersMap: Record<string, string>;
  losersMap: Record<string, string>;
}) {
  if (/^W\d+$/.test(slot)) {
    return winnersMap[slot] ?? null;
  }

  if (/^L\d+$/.test(slot)) {
    return losersMap[slot] ?? null;
  }

  if (/^3[A-L]+$/.test(slot)) {
    const assignedGroup = thirdPlaceAssignment[slot];
    return assignedGroup ? seedMap[`${assignedGroup}3`] : null;
  }

  return resolveSeedSlot(slot, seedMap);
}

function buildFixture(
  template: KnockoutTemplateFixture,
  homeTeamId: string,
  awayTeamId: string,
  teamMap: Map<string, Team>,
  settings: SimulationWeights,
  winnerTeamId?: string,
  overriddenWinnerTeamId?: string,
): BracketFixture {
  const homeTeam = teamMap.get(homeTeamId);
  const awayTeam = teamMap.get(awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new Error(`Missing team data for knockout template ${template.id}`);
  }

  const shares = calculateKnockoutWinShare(homeTeam, awayTeam, settings);

  return {
    id: template.id,
    scheduleMatchId: template.id,
    stage: template.stage,
    roundLabel: template.roundLabel,
    homeTeamId,
    awayTeamId,
    kickoff: template.kickoff,
    venue: template.venue,
    city: template.city,
    homeSeedLabel: template.homeSlot,
    awaySeedLabel: template.awaySlot,
    pairingLabel: `${template.homeSlot} vs ${template.awaySlot}`,
    homeWinProbability: Number((shares.home * 100).toFixed(1)),
    awayWinProbability: Number((shares.away * 100).toFixed(1)),
    winnerTeamId,
    overriddenWinnerTeamId,
    explanation: buildMatchPredictionBreakdown(homeTeam, awayTeam, settings),
  };
}

export function getKnockoutTemplates() {
  return [...KNOCKOUT_TEMPLATES];
}

export function buildKnockoutBracket({
  seedMap,
  qualifiedThirdGroups,
  teams,
  settings = DEFAULT_SIMULATION_WEIGHTS,
  random,
  overrides = [],
}: {
  seedMap: Record<string, string>;
  qualifiedThirdGroups: string[];
  teams: Team[];
  settings?: SimulationWeights;
  random?: () => number;
  overrides?: WinnerOverride[];
}) {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const winnersMap: Record<string, string> = {};
  const losersMap: Record<string, string> = {};
  const thirdPlaceAssignment = resolveThirdPlaceSlots(qualifiedThirdGroups);
  const overridesByFixture = overrides.reduce<Record<string, string>>((map, override) => {
    map[override.fixtureId] = override.winnerTeamId;
    return map;
  }, {});
  const bracket = DISPLAY_BRACKET_ORDER.reduce<Record<string, BracketFixture[]>>((map, stage) => {
    map[stage] = [];
    return map;
  }, {});

  for (const template of [...KNOCKOUT_TEMPLATES].sort((left, right) => templateMatchNumber(left.id) - templateMatchNumber(right.id))) {
    const homeTeamId = resolveFixtureSlot({
      slot: template.homeSlot,
      seedMap,
      thirdPlaceAssignment,
      winnersMap,
      losersMap,
    });
    const awayTeamId = resolveFixtureSlot({
      slot: template.awaySlot,
      seedMap,
      thirdPlaceAssignment,
      winnersMap,
      losersMap,
    });

    if (!homeTeamId || !awayTeamId) {
      throw new Error(`Unable to resolve knockout slot ${template.homeSlot} vs ${template.awaySlot} for ${template.id}`);
    }

    const homeTeam = teamMap.get(homeTeamId);
    const awayTeam = teamMap.get(awayTeamId);

    if (!homeTeam || !awayTeam) {
      throw new Error(`Unable to locate knockout teams ${homeTeamId} and ${awayTeamId}`);
    }

    const forcedWinnerTeamId = overridesByFixture[template.id];
    const winnerTeamId = random
      ? pickWinner(homeTeam, awayTeam, random(), settings, forcedWinnerTeamId)
      : forcedWinnerTeamId ?? (calculateKnockoutWinShare(homeTeam, awayTeam, settings).home >= 0.5 ? homeTeam.id : awayTeam.id);
    const loserTeamId = winnerTeamId === homeTeam.id ? awayTeam.id : homeTeam.id;

    winnersMap[`W${template.id.replace("M", "")}`] = winnerTeamId;
    losersMap[`L${template.id.replace("M", "")}`] = loserTeamId;

    if (template.stage === "THIRD_PLACE") {
      continue;
    }

    bracket[template.stage].push(buildFixture(template, homeTeamId, awayTeamId, teamMap, settings, winnerTeamId, forcedWinnerTeamId));
  }

  return {
    bracket,
    thirdPlaceAssignment,
  };
}

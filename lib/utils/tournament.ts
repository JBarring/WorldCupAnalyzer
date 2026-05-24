import type { ComparisonStat, Match } from "@/types";

export function normalizeGroupCode(group?: string | null) {
  if (!group) return null;

  const trimmed = group.trim();

  if (/^[A-L]$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const groupMatch = trimmed.match(/^group\s+([A-L])$/i);
  if (groupMatch) {
    return groupMatch[1].toUpperCase();
  }

  return null;
}

export function getGroupLabel(group?: string | null) {
  const normalized = normalizeGroupCode(group);
  return normalized ? `Group ${normalized}` : group ?? "Group";
}

export function describeKnockoutSlot(slot?: string | null) {
  if (!slot) return "Projected entrant";

  const normalized = slot.trim().toUpperCase();

  if (/^[12][A-L]$/.test(normalized)) {
    const [, position, group] = normalized.match(/^([12])([A-L])$/) ?? [];
    return `${position === "1" ? "Winner" : "Runner-up"} Group ${group}`;
  }

  if (/^3[A-L]+$/.test(normalized)) {
    return `Best third from ${normalized.slice(1).split("").join(", ")}`;
  }

  if (/^W\d+$/.test(normalized)) {
    return `Winner M${normalized.slice(1)}`;
  }

  if (/^L\d+$/.test(normalized)) {
    return `Loser M${normalized.slice(1)}`;
  }

  return normalized;
}

export function getStageLabel(match: Match) {
  if (match.stage === "GROUP" && match.group) {
    return getGroupLabel(match.group);
  }

  return match.roundLabel;
}

export function buildComparisonStats(match: Match): ComparisonStat[] {
  return [
    {
      label: "Possession",
      homeValue: match.homeStats.possession,
      awayValue: match.awayStats.possession,
      suffix: "%",
    },
    {
      label: "Shots",
      homeValue: match.homeStats.shots,
      awayValue: match.awayStats.shots,
    },
    {
      label: "Shots On Target",
      homeValue: match.homeStats.shotsOnTarget,
      awayValue: match.awayStats.shotsOnTarget,
    },
    {
      label: "xG",
      homeValue: match.homeStats.xg,
      awayValue: match.awayStats.xg,
    },
    {
      label: "Big Chances",
      homeValue: match.homeStats.bigChances,
      awayValue: match.awayStats.bigChances,
    },
    {
      label: "Passes",
      homeValue: match.homeStats.passes,
      awayValue: match.awayStats.passes,
    },
  ];
}

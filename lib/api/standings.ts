import { getPredictionSnapshot } from "@/lib/api/predictions";

export async function getStandings() {
  const standings = Object.values((await getPredictionSnapshot(2400)).projectedGroups).flat();

  return [...standings].sort((left, right) => {
    if (left.group !== right.group) {
      return left.group.localeCompare(right.group);
    }

    if (right.projectedPoints !== left.projectedPoints) return right.projectedPoints - left.projectedPoints;
    if (right.projectedGoalDifference !== left.projectedGoalDifference) return right.projectedGoalDifference - left.projectedGoalDifference;
    if (right.projectedGoalsFor !== left.projectedGoalsFor) return right.projectedGoalsFor - left.projectedGoalsFor;

    return left.teamId.localeCompare(right.teamId);
  });
}

export async function getStandingsByGroup() {
  const standings = await getStandings();

  return standings.reduce<Record<string, typeof standings>>((groups, standing) => {
    groups[standing.group] ??= [];
    groups[standing.group].push(standing);
    return groups;
  }, {});
}

import { getMatchesSource, getTeamsSource } from "@/lib/api/data-source";
import { DEFAULT_SIMULATION_WEIGHTS } from "@/lib/simulations/elo";
import { runTournamentMonteCarlo } from "@/lib/simulations/monteCarlo";
import type { SimulationWeights, WinnerOverride } from "@/types";

export async function getPredictionSnapshot(
  iterations = 3500,
  settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS,
  overrides: WinnerOverride[] = [],
) {
  const [teams, matches] = await Promise.all([getTeamsSource(), getMatchesSource()]);

  return runTournamentMonteCarlo({
    teams,
    matches,
    iterations,
    settings,
    overrides,
  });
}

export async function getStaticPredictions() {
  const summary = await getPredictionSnapshot(2400);
  return [...summary.teamOdds].sort((left, right) => right.tournamentWinPct - left.tournamentWinPct);
}

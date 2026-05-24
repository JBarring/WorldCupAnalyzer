import { clamp } from "@/lib/utils/format";
import type { MatchPredictionBreakdown, MomentumPoint, SimulationWeights, Team } from "@/types";

export const DEFAULT_SIMULATION_WEIGHTS: SimulationWeights = {
  elo: 0.58,
  ranking: 0.2,
  form: 0.14,
  goalDifferential: 0.08,
  neutralSiteFactor: 0.92,
};

const DRAW_FLOOR = 0.17;
const DRAW_CEILING = 0.29;
const BASE_TOTAL_XG = 2.65;

function rankToRating(rank: number) {
  return 2140 - rank * 8;
}

function formToBonus(form: Team["form"]) {
  const weights = [1.25, 1.1, 0.95, 0.8, 0.65];
  const scoreMap = { W: 1, D: 0.3, L: -0.8 };

  return form.reduce((total, result, index) => total + scoreMap[result] * weights[index] * 16, 0);
}

function normalizeWeights(settings: SimulationWeights) {
  const total = settings.elo + settings.ranking + settings.form + settings.goalDifferential;

  if (total <= 0) {
    return {
      elo: 1,
      ranking: 0,
      form: 0,
      goalDifferential: 0,
    };
  }

  return {
    elo: settings.elo / total,
    ranking: settings.ranking / total,
    form: settings.form / total,
    goalDifferential: settings.goalDifferential / total,
  };
}

function getComponentEdges(homeTeam: Team, awayTeam: Team) {
  return {
    elo: homeTeam.eloRating - awayTeam.eloRating,
    ranking: rankToRating(homeTeam.fifaRank) - rankToRating(awayTeam.fifaRank),
    form: formToBonus(homeTeam.form) - formToBonus(awayTeam.form),
    goalDifferential: (homeTeam.goalDifferential - awayTeam.goalDifferential) * 14,
  };
}

export function getBlendedTeamStrength(team: Team, settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS) {
  const weights = normalizeWeights(settings);
  const eloComponent = team.eloRating;
  const rankingComponent = rankToRating(team.fifaRank);
  const formComponent = team.eloRating + formToBonus(team.form);
  const goalDiffComponent = team.eloRating + team.goalDifferential * 14;

  /**
   * The model keeps every input on an Elo-like scale, then blends them with
   * user-adjustable weights. That makes it easy to explain why a slider move
   * changes the projection without rewriting the downstream probability math.
   */
  return (
    eloComponent * weights.elo +
    rankingComponent * weights.ranking +
    formComponent * weights.form +
    goalDiffComponent * weights.goalDifferential
  );
}

export function getExpectedGoals(homeTeam: Team, awayTeam: Team, settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS) {
  const homeStrength = getBlendedTeamStrength(homeTeam, settings);
  const awayStrength = getBlendedTeamStrength(awayTeam, settings);
  const ratingGap = (homeStrength - awayStrength) * settings.neutralSiteFactor;
  const xgShift = clamp(ratingGap / 520, -0.78, 0.78);

  /**
   * We convert the rating gap into a modest xG swing instead of jumping
   * straight to a scoreline. That gives the app a stable way to project shots,
   * possession, and likely match margins before kickoff.
   */
  const home = clamp(1.28 + xgShift, 0.45, 2.65);
  const away = clamp(BASE_TOTAL_XG - home, 0.35, 2.25);

  return {
    home,
    away,
  };
}

export function buildProjectedStatLine(team: Team, opponent: Team, isHome: boolean, settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS) {
  const xg = isHome ? getExpectedGoals(team, opponent, settings).home : getExpectedGoals(opponent, team, settings).away;
  const strengthGap = getBlendedTeamStrength(team, settings) - getBlendedTeamStrength(opponent, settings);
  const possession = clamp(Math.round(50 + strengthGap / 22), 34, 66);
  const shots = Math.max(5, Math.round(xg * 7.2 + possession / 10));
  const shotsOnTarget = Math.max(1, Math.round(xg * 2.6));
  const bigChances = Math.max(0, Math.round(xg * 1.35 - 0.3));
  const passes = Math.max(250, Math.round(260 + possession * 5.2));

  return {
    possession,
    shots,
    shotsOnTarget,
    xg: Number(xg.toFixed(2)),
    bigChances,
    passes,
  };
}

export function buildProjectedMomentum(homeTeam: Team, awayTeam: Team, settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS): MomentumPoint[] {
  const homeStrength = getBlendedTeamStrength(homeTeam, settings);
  const awayStrength = getBlendedTeamStrength(awayTeam, settings);
  const baseEdge = clamp((homeStrength - awayStrength) / 260, -0.5, 0.5);

  return [0, 15, 30, 45, 60, 75, 90].map((minute, index) => {
    const oscillation = Math.sin((minute + 8) / 15) * 0.07 + Math.cos((index + 1) * 0.9) * 0.03;
    const home = clamp(0.5 + baseEdge * 0.34 + oscillation, 0.18, 0.82);
    const away = clamp(1 - home + Math.sin((index + 1) * 0.6) * 0.02, 0.18, 0.82);

    return {
      minute,
      home: Number(home.toFixed(3)),
      away: Number(away.toFixed(3)),
    };
  });
}

export function calculateMatchWinProbability(homeTeam: Team, awayTeam: Team, settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS) {
  const homeStrength = getBlendedTeamStrength(homeTeam, settings);
  const awayStrength = getBlendedTeamStrength(awayTeam, settings);
  const neutralWeightedGap = (homeStrength - awayStrength) * settings.neutralSiteFactor;
  const expectedHomeShare = 1 / (1 + 10 ** (-neutralWeightedGap / 400));

  /**
   * Draw odds stay highest when the teams are closely matched, then taper down
   * as the gap widens. Knockout conversion happens in a separate helper.
   */
  const drawProbability = clamp(0.27 - Math.abs(neutralWeightedGap) / 1900, DRAW_FLOOR, DRAW_CEILING);
  const nonDrawShare = 1 - drawProbability;
  const homeWinProbability = expectedHomeShare * nonDrawShare;
  const awayWinProbability = (1 - expectedHomeShare) * nonDrawShare;

  return {
    home: Number((homeWinProbability * 100).toFixed(1)),
    draw: Number((drawProbability * 100).toFixed(1)),
    away: Number((awayWinProbability * 100).toFixed(1)),
  };
}

export function calculateKnockoutWinShare(homeTeam: Team, awayTeam: Team, settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS) {
  const probabilities = calculateMatchWinProbability(homeTeam, awayTeam, settings);
  const ratingEdge = clamp((getBlendedTeamStrength(homeTeam, settings) - getBlendedTeamStrength(awayTeam, settings)) / 620, -0.18, 0.18);
  const homeExtraTimeShare = 0.5 + ratingEdge;
  const awayExtraTimeShare = 1 - homeExtraTimeShare;
  const home = probabilities.home + probabilities.draw * homeExtraTimeShare;
  const away = probabilities.away + probabilities.draw * awayExtraTimeShare;
  const total = home + away;

  return {
    home: home / total,
    away: away / total,
  };
}

export function buildMatchPredictionBreakdown(
  homeTeam: Team,
  awayTeam: Team,
  settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS,
): MatchPredictionBreakdown {
  const edges = getComponentEdges(homeTeam, awayTeam);
  const weights = normalizeWeights(settings);
  const weightedGap =
    edges.elo * weights.elo +
    edges.ranking * weights.ranking +
    edges.form * weights.form +
    edges.goalDifferential * weights.goalDifferential;
  const shares = calculateKnockoutWinShare(homeTeam, awayTeam, settings);
  const favoriteTeamId = shares.home >= shares.away ? homeTeam.id : awayTeam.id;
  const expectedGoals = getExpectedGoals(homeTeam, awayTeam, settings);
  const projectedHomeGoals = Math.max(0, Math.round(expectedGoals.home - 0.1));
  const projectedAwayGoals = Math.max(0, Math.round(expectedGoals.away - 0.1));
  const projectedOutcome = projectedHomeGoals === projectedAwayGoals ? "DRAW" : projectedHomeGoals > projectedAwayGoals ? "HOME" : "AWAY";

  return {
    favoriteTeamId,
    projectedScoreline: `${projectedHomeGoals}-${projectedAwayGoals}`,
    projectedOutcome,
    ratingGap: Number(weightedGap.toFixed(1)),
    upsetRisk: Number((100 - Math.max(shares.home, shares.away) * 100).toFixed(1)),
    factors: [
      {
        label: "Elo anchor",
        homeEdge: Number((edges.elo * weights.elo).toFixed(1)),
        awayEdge: Number((-edges.elo * weights.elo).toFixed(1)),
        description: "Long-horizon strength from the imported rating snapshot.",
      },
      {
        label: "World rank",
        homeEdge: Number((edges.ranking * weights.ranking).toFixed(1)),
        awayEdge: Number((-edges.ranking * weights.ranking).toFixed(1)),
        description: "Rank-based correction that rewards teams sitting higher in the global order.",
      },
      {
        label: "Recent form",
        homeEdge: Number((edges.form * weights.form).toFixed(1)),
        awayEdge: Number((-edges.form * weights.form).toFixed(1)),
        description: "Short-term trend proxy built from the latest snapshot form string.",
      },
      {
        label: "Goal differential",
        homeEdge: Number((edges.goalDifferential * weights.goalDifferential).toFixed(1)),
        awayEdge: Number((-edges.goalDifferential * weights.goalDifferential).toFixed(1)),
        description: "Recent margin profile used as a light quality-of-performance signal.",
      },
    ],
  };
}

function samplePoisson(lambda: number, random: () => number) {
  const limit = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  while (product > limit) {
    count += 1;
    product *= random();
  }

  return count - 1;
}

export function simulateMatchScore(homeTeam: Team, awayTeam: Team, random: () => number, settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS) {
  const expectedGoals = getExpectedGoals(homeTeam, awayTeam, settings);
  const home = clamp(samplePoisson(expectedGoals.home, random), 0, 7);
  const away = clamp(samplePoisson(expectedGoals.away, random), 0, 7);

  return { home, away };
}

export function pickWinner(
  homeTeam: Team,
  awayTeam: Team,
  random: number,
  settings: SimulationWeights = DEFAULT_SIMULATION_WEIGHTS,
  forcedWinnerTeamId?: string,
) {
  if (forcedWinnerTeamId === homeTeam.id || forcedWinnerTeamId === awayTeam.id) {
    return forcedWinnerTeamId;
  }

  const shares = calculateKnockoutWinShare(homeTeam, awayTeam, settings);
  return random <= shares.home ? homeTeam.id : awayTeam.id;
}

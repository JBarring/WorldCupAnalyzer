export type MatchStatus = "UPCOMING" | "LIVE" | "FINAL";

export type MatchStage =
  | "GROUP"
  | "ROUND_OF_32"
  | "ROUND_OF_16"
  | "QUARTERFINAL"
  | "SEMIFINAL"
  | "THIRD_PLACE"
  | "FINAL";

export type MatchEventType =
  | "goal"
  | "penalty"
  | "yellow-card"
  | "red-card"
  | "substitution"
  | "var"
  | "save"
  | "chance"
  | "kickoff"
  | "full-time";

export type QualificationStatus = "qualified" | "playoff" | "alive" | "eliminated";

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  confederation: string;
  group: string;
  fifaRank: number;
  eloRating: number;
  form: Array<"W" | "D" | "L">;
  goalDifferential: number;
  goalsFor: number;
  goalsAgainst: number;
  flagEmoji: string;
  starCount: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface MatchStatLine {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  xg: number;
  bigChances: number;
  passes: number;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface MomentumPoint {
  minute: number;
  home: number;
  away: number;
}

export interface Match {
  id: string;
  slug: string;
  homeTeamId: string;
  awayTeamId: string;
  venue: string;
  city: string;
  kickoff: string;
  stage: MatchStage;
  status: MatchStatus;
  group?: string;
  roundLabel: string;
  minute?: number;
  score: MatchScore;
  homeStats: MatchStatLine;
  awayStats: MatchStatLine;
  winProbability: {
    home: number;
    draw: number;
    away: number;
  };
  momentum: MomentumPoint[];
  timelineEventIds: string[];
  bracketSlot?: string;
  winnerTeamId?: string;
  featured?: boolean;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  minute: number;
  teamId: string;
  player: string;
  type: MatchEventType;
  label: string;
  detail?: string;
}

export interface HydratedMatch extends Match {
  homeTeam: Team;
  awayTeam: Team;
  events?: MatchEvent[];
}

export interface RecentTeamResult {
  date: string;
  opponentTeamId: string;
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
  venue: "Home" | "Away" | "Neutral";
  competition: string;
}

export interface TeamProfile {
  teamId: string;
  captain: string;
  preferredFormation: string;
  alternateFormation: string;
  styleLabel: string;
  overview: string;
  keyPlayers: string[];
  strengths: string[];
  recentResults: RecentTeamResult[];
}

export interface TeamProfileSnapshot {
  team: Team;
  profile: TeamProfile;
  tournamentMatches: HydratedMatch[];
}

export interface GroupStanding {
  teamId: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualificationStatus: QualificationStatus;
}

export interface PredictionResult {
  teamId: string;
  advancePct: number;
  quarterfinalPct: number;
  semifinalPct: number;
  finalPct: number;
  tournamentWinPct: number;
  upsetLikelihood: number;
  pathDifficulty: number;
  powerRating: number;
  mostLikelyFinalOpponentId: string;
}

export interface SimulationWeights {
  elo: number;
  ranking: number;
  form: number;
  goalDifferential: number;
  neutralSiteFactor: number;
}

export interface MatchPredictionFactor {
  label: string;
  homeEdge: number;
  awayEdge: number;
  description: string;
}

export interface MatchPredictionBreakdown {
  favoriteTeamId: string;
  projectedScoreline: string;
  projectedOutcome: GroupMatchOutcome;
  ratingGap: number;
  upsetRisk: number;
  factors: MatchPredictionFactor[];
}

export interface KnockoutTemplateFixture {
  id: string;
  stage: Exclude<MatchStage, "GROUP">;
  roundLabel: string;
  homeSlot: string;
  awaySlot: string;
  kickoff: string;
  venue: string;
  city: string;
}

export interface WinnerOverride {
  fixtureId: string;
  winnerTeamId: string;
}

export type GroupMatchOutcome = "HOME" | "DRAW" | "AWAY";

export interface GroupMatchOverride {
  matchId: string;
  outcome: GroupMatchOutcome;
}

export interface ProjectedGroupStanding extends GroupStanding {
  projectedPoints: number;
  projectedGoalDifference: number;
  projectedGoalsFor: number;
  finishFirstPct: number;
  advancePct: number;
}

export interface ComparisonStat {
  label: string;
  homeValue: number;
  awayValue: number;
  suffix?: string;
}

export interface BracketFixture {
  id: string;
  stage: Exclude<MatchStage, "GROUP">;
  roundLabel: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduleMatchId?: string;
  kickoff?: string;
  venue?: string;
  city?: string;
  homeSeedLabel?: string;
  awaySeedLabel?: string;
  pairingLabel?: string;
  homeWinProbability: number;
  awayWinProbability: number;
  winnerTeamId?: string;
  overriddenWinnerTeamId?: string;
  explanation?: MatchPredictionBreakdown;
}

export interface TournamentSimulationSummary {
  iterations: number;
  generatedAt: string;
  modelSettings: SimulationWeights;
  championTeamId: string;
  finalMatchup: {
    homeTeamId: string;
    awayTeamId: string;
    probability: number;
  };
  projectedGroups: Record<string, ProjectedGroupStanding[]>;
  teamOdds: Array<
    PredictionResult & {
      championCount: number;
    }
  >;
  bracket: Record<string, BracketFixture[]>;
}

"use client";

import { create } from "zustand";

import { DEFAULT_SIMULATION_WEIGHTS } from "@/lib/simulations/elo";
import type { BracketFixture, GroupMatchOutcome, SimulationWeights, TournamentSimulationSummary } from "@/types";

interface TournamentStore {
  selectedGroup: string | null;
  favoriteTeamIds: string[];
  simulationIterations: number;
  currentSimulation: TournamentSimulationSummary | null;
  bracketPreview: Record<string, BracketFixture[]>;
  modelSettings: SimulationWeights;
  winnerOverrides: Record<string, string>;
  groupMatchOverrides: Record<string, GroupMatchOutcome>;
  setSelectedGroup: (group: string | null) => void;
  toggleFavoriteTeam: (teamId: string) => void;
  setSimulationIterations: (iterations: number) => void;
  setModelWeight: (field: keyof SimulationWeights, value: number) => void;
  resetModelSettings: () => void;
  setWinnerOverride: (fixtureId: string, winnerTeamId?: string) => void;
  setGroupMatchOverride: (matchId: string, outcome?: GroupMatchOutcome) => void;
  clearWinnerOverrides: () => void;
  hydrateSimulation: (simulation: TournamentSimulationSummary) => void;
}

export const useTournamentStore = create<TournamentStore>((set) => ({
  selectedGroup: null,
  favoriteTeamIds: ["USA", "ARG"],
  simulationIterations: 3500,
  currentSimulation: null,
  bracketPreview: {},
  modelSettings: DEFAULT_SIMULATION_WEIGHTS,
  winnerOverrides: {},
  groupMatchOverrides: {},
  setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
  toggleFavoriteTeam: (teamId) =>
    set((state) => ({
      favoriteTeamIds: state.favoriteTeamIds.includes(teamId)
        ? state.favoriteTeamIds.filter((id) => id !== teamId)
        : [...state.favoriteTeamIds, teamId],
    })),
  setSimulationIterations: (simulationIterations) => set({ simulationIterations }),
  setModelWeight: (field, value) =>
    set((state) => ({
      modelSettings: {
        ...state.modelSettings,
        [field]: value,
      },
    })),
  resetModelSettings: () => set({ modelSettings: DEFAULT_SIMULATION_WEIGHTS }),
  setWinnerOverride: (fixtureId, winnerTeamId) =>
    set((state) => {
      const winnerOverrides = { ...state.winnerOverrides };

      if (!winnerTeamId) {
        delete winnerOverrides[fixtureId];
      } else {
        winnerOverrides[fixtureId] = winnerTeamId;
      }

      return { winnerOverrides };
    }),
  setGroupMatchOverride: (matchId, outcome) =>
    set((state) => {
      const groupMatchOverrides = { ...state.groupMatchOverrides };

      if (!outcome) {
        delete groupMatchOverrides[matchId];
      } else {
        groupMatchOverrides[matchId] = outcome;
      }

      return { groupMatchOverrides };
    }),
  clearWinnerOverrides: () => set({ winnerOverrides: {} }),
  hydrateSimulation: (currentSimulation) =>
    set({
      currentSimulation,
      bracketPreview: currentSimulation.bracket,
    }),
}));

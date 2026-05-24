import { getTeamsSource } from "@/lib/api/data-source";

export async function getTeams() {
  return getTeamsSource();
}

export async function getTeamById(teamId: string) {
  const teams = await getTeamsSource();
  return teams.find((team) => team.id === teamId) ?? null;
}

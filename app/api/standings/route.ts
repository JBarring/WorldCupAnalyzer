import { getStandingsByGroup } from "@/lib/api";

export async function GET() {
  const standings = await getStandingsByGroup();
  return Response.json(standings);
}

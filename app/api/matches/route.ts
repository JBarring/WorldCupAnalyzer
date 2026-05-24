import { getMatches } from "@/lib/api";

export async function GET() {
  const matches = await getMatches();
  return Response.json(matches);
}

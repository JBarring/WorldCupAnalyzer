import { getMatchBySlug } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await getMatchBySlug(matchId);

  if (!match) {
    return Response.json({ error: "Match not found" }, { status: 404 });
  }

  return Response.json(match);
}

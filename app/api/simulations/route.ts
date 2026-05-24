import { getPredictionSnapshot } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const iterations = Number(searchParams.get("iterations") ?? "3500");

  const result = await getPredictionSnapshot(Number.isFinite(iterations) ? iterations : 3500);
  return Response.json(result);
}

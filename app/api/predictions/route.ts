import { getPredictionSnapshot, getStaticPredictions } from "@/lib/api";

export async function GET() {
  const [simulation, baseline] = await Promise.all([getPredictionSnapshot(3500), getStaticPredictions()]);

  return Response.json({
    simulation,
    baseline,
  });
}

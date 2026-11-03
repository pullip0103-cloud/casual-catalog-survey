import { NextResponse, connection } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { buildStatsResult, type RawResponse } from "@/lib/stats";

export async function GET() {
  await connection();
  const [responsesSnap, regionsSnap] = await Promise.all([
    adminDb.collection("survey_responses").get(),
    adminDb.collection("survey_regions").get(),
  ]);
  const responses = responsesSnap.docs.map((doc) => doc.data() as RawResponse);
  const regionNames = new Set(regionsSnap.docs.map((doc) => doc.data().name as string));
  for (const r of responses) regionNames.add(r.region);

  const byRegion: Record<string, ReturnType<typeof buildStatsResult>> = {};
  for (const region of regionNames) {
    byRegion[region] = buildStatsResult(responses.filter((r) => r.region === region));
  }
  return NextResponse.json({ national: buildStatsResult(responses), byRegion });
}

import { NextResponse, connection } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { buildStatsResult, type RawResponse } from "@/lib/stats";

export async function GET() {
  await connection();
  const snap = await adminDb.collection("survey_responses").get();
  const responses = snap.docs.map((doc) => doc.data() as RawResponse);
  const byRegion: Record<string, ReturnType<typeof buildStatsResult>> = {};
  for (const region of new Set(responses.map((r) => r.region))) {
    byRegion[region] = buildStatsResult(responses.filter((r) => r.region === region));
  }
  return NextResponse.json({ national: buildStatsResult(responses), byRegion });
}

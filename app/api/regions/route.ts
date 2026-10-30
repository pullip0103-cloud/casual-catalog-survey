import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  const snap = await adminDb.collection("survey_regions").orderBy("name").get();
  const regions = snap.docs.map((doc) => doc.data().name as string);
  return NextResponse.json({ regions });
}

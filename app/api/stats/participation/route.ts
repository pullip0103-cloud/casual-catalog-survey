import { NextResponse, connection } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { BranchType } from "@/lib/types";

interface BranchDoc {
  region: string;
  name: string;
  branchType: BranchType;
}

interface ResponseDoc {
  region: string;
  branchType: BranchType;
  branchName: string;
}

interface BranchParticipation {
  name: string;
  branchType: BranchType;
  responded: boolean;
}

interface TypeCount {
  total: number;
  responded: number;
}

interface RegionParticipation {
  total: number;
  responded: number;
  byType: Record<BranchType, TypeCount>;
  branches: BranchParticipation[];
}

export async function GET() {
  await connection();

  const [branchesSnap, responsesSnap] = await Promise.all([
    adminDb.collection("survey_branches").get(),
    adminDb.collection("survey_responses").get(),
  ]);

  const branches = branchesSnap.docs.map((d) => d.data() as BranchDoc);
  const responses = responsesSnap.docs.map((d) => d.data() as ResponseDoc);

  const respondedKeys = new Set(
    responses.map((r) => `${r.region}::${r.branchType}::${r.branchName}`)
  );

  const byRegion: Record<string, RegionParticipation> = {};

  for (const b of branches) {
    const key = `${b.region}::${b.branchType}::${b.name}`;
    const responded = respondedKeys.has(key);

    if (!byRegion[b.region]) {
      byRegion[b.region] = {
        total: 0,
        responded: 0,
        byType: {
          지점: { total: 0, responded: 0 },
          대리점: { total: 0, responded: 0 },
        },
        branches: [],
      };
    }
    const region = byRegion[b.region];
    region.total += 1;
    if (responded) region.responded += 1;
    region.byType[b.branchType].total += 1;
    if (responded) region.byType[b.branchType].responded += 1;
    region.branches.push({ name: b.name, branchType: b.branchType, responded });
  }

  for (const region of Object.values(byRegion)) {
    region.branches.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }

  const national: RegionParticipation = {
    total: branches.length,
    responded: branches.filter((b) =>
      respondedKeys.has(`${b.region}::${b.branchType}::${b.name}`)
    ).length,
    byType: {
      지점: { total: 0, responded: 0 },
      대리점: { total: 0, responded: 0 },
    },
    branches: [],
  };
  for (const b of branches) {
    const responded = respondedKeys.has(`${b.region}::${b.branchType}::${b.name}`);
    national.byType[b.branchType].total += 1;
    if (responded) national.byType[b.branchType].responded += 1;
  }

  return NextResponse.json({ national, byRegion });
}

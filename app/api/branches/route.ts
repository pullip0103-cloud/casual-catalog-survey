import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { BranchType } from "@/lib/types";

// 거점 코드는 여기서 클라이언트에 내려주지 않는다 — 코드 검증은 /api/verify-code가 서버에서 처리한다.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");
  const branchType = searchParams.get("branchType") as BranchType | null;

  if (!region || !branchType) {
    return NextResponse.json({ error: "region, branchType가 필요합니다." }, { status: 400 });
  }

  // region(단일 필드)만으로 쿼리하고 branchType은 메모리에서 필터링한다 —
  // region+branchType 복합 인덱스를 새로 만들 필요가 없도록(bms-fullcheck와 동일 패턴).
  const snap = await adminDb.collection("survey_branches").where("region", "==", region).get();
  const branches = snap.docs
    .map((doc) => ({ id: doc.id, name: doc.data().name as string, branchType: doc.data().branchType as BranchType }))
    .filter((b) => b.branchType === branchType)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));

  return NextResponse.json({ branches: branches.map((b) => ({ id: b.id, name: b.name })) });
}

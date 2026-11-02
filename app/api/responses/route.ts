import { NextRequest, NextResponse, connection } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { Awareness, Q1A, Q1AReason, Q1C, Q1CRatio } from "@/lib/types";

function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9가-힣]/g, "");
}

const AWARENESS_VALUES: Awareness[] = ["used_in_response", "aware_not_used", "unaware"];
const Q1A_VALUES: Q1A[] = [
  "very_helpful",
  "somewhat_helpful",
  "neutral",
  "not_very_helpful",
  "not_helpful_at_all",
];
const Q1A_NOT_HELPFUL_VALUES: Q1A[] = ["not_very_helpful", "not_helpful_at_all"];
const Q1AREASON_VALUES: Q1AReason[] = ["fewer_pages", "thin_material", "other"];
const Q1C_VALUES: Q1C[] = ["hq_decide", "branch_ratio"];
const Q1CRATIO_VALUES: Q1CRatio[] = ["95_5", "90_10", "70_30"];

export async function POST(req: NextRequest) {
  await connection();
  const body = await req.json();
  const { branchId, code, awareness, q1a, q1aReason, q1aReasonOther, q1c, q1cRatio, generalComment } =
    body ?? {};

  if (
    !branchId ||
    !code ||
    !AWARENESS_VALUES.includes(awareness) ||
    !Q1A_VALUES.includes(q1a) ||
    !Q1C_VALUES.includes(q1c)
  ) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }
  if (Q1A_NOT_HELPFUL_VALUES.includes(q1a) && !Q1AREASON_VALUES.includes(q1aReason)) {
    return NextResponse.json({ error: "도움이 되지 않은 이유를 선택해주세요." }, { status: 400 });
  }
  if (q1aReason === "other" && !q1aReasonOther) {
    return NextResponse.json({ error: "기타 이유를 입력해주세요." }, { status: 400 });
  }
  if (q1c === "branch_ratio" && !Q1CRATIO_VALUES.includes(q1cRatio)) {
    return NextResponse.json({ error: "비중 선택이 올바르지 않습니다." }, { status: 400 });
  }

  const branchDoc = await adminDb.collection("survey_branches").doc(branchId).get();
  if (!branchDoc.exists) {
    return NextResponse.json({ error: "거점 정보를 찾을 수 없습니다." }, { status: 404 });
  }
  const branch = branchDoc.data() as { region: string; name: string; branchType: string; code: string };
  if (normalizeCode(branch.code) !== normalizeCode(code)) {
    return NextResponse.json({ error: "지점/대리점 코드를 다시 확인해주세요." }, { status: 403 });
  }

  const doc: Record<string, unknown> = {
    region: branch.region,
    branchType: branch.branchType,
    branchName: branch.name,
    awareness,
    q1a,
    q1c,
    createdAt: new Date().toISOString(),
  };
  if (Q1A_NOT_HELPFUL_VALUES.includes(q1a)) {
    doc.q1aReason = q1aReason;
    if (q1aReason === "other") doc.q1aReasonOther = q1aReasonOther;
  }
  if (q1c === "branch_ratio") doc.q1cRatio = q1cRatio;
  if (typeof generalComment === "string" && generalComment.trim()) {
    doc.generalComment = generalComment.trim();
  }

  await adminDb.collection("survey_responses").add(doc);

  return NextResponse.json({ ok: true });
}

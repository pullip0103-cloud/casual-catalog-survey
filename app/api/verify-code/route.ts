import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// 대소문자 구분 없이, 문자/숫자만 비교한다(공백·하이픈 등 기호는 무시).
function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9가-힣]/g, "");
}

export async function POST(req: NextRequest) {
  const { branchId, code } = await req.json();

  if (!branchId || !code) {
    return NextResponse.json({ error: "branchId, code가 필요합니다." }, { status: 400 });
  }

  const doc = await adminDb.collection("survey_branches").doc(branchId).get();
  if (!doc.exists) {
    return NextResponse.json({ valid: false });
  }

  const storedCode = doc.data()?.code as string | undefined;
  const valid = !!storedCode && normalizeCode(storedCode) === normalizeCode(code);

  return NextResponse.json({ valid });
}

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore(app);

const AWARENESS = ["used_in_response", "aware_not_used", "unaware"];
const Q1A = ["very_helpful", "somewhat_helpful", "neutral", "not_very_helpful", "not_helpful_at_all"];
const Q1A_NOT_HELPFUL = ["not_very_helpful", "not_helpful_at_all"];
const Q1AREASON = ["fewer_pages", "thin_material", "other"];
const Q1C = ["hq_decide", "branch_ratio"];
const Q1CRATIO = ["95_5", "90_10", "70_30"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const branchesSnap = await db.collection("survey_branches").get();
  const branches = branchesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log(`전체 거점 ${branches.length}개 중 샘플 60개 응답 생성`);

  const sampled = [];
  for (let i = 0; i < 60; i++) {
    sampled.push(branches[Math.floor(Math.random() * branches.length)]);
  }

  const batch = db.batch();
  for (const b of sampled) {
    const awareness = pick(AWARENESS);
    const q1a = pick(Q1A);
    const q1aReason = Q1A_NOT_HELPFUL.includes(q1a) ? pick(Q1AREASON) : undefined;
    const q1c = pick(Q1C);
    const q1cRatio = q1c === "branch_ratio" ? pick(Q1CRATIO) : undefined;

    const doc = {
      region: b.region,
      branchType: b.branchType,
      branchName: b.name,
      awareness,
      q1a,
      q1c,
      createdAt: new Date().toISOString(),
      __sample: true,
    };
    if (q1aReason) {
      doc.q1aReason = q1aReason;
      if (q1aReason === "other") doc.q1aReasonOther = "샘플 이유입니다.";
    }
    if (q1cRatio) doc.q1cRatio = q1cRatio;
    if (Math.random() < 0.3) doc.generalComment = "샘플 의견입니다.";

    const ref = db.collection("survey_responses").doc();
    batch.set(ref, doc);
  }
  await batch.commit();
  console.log("샘플 응답 60건 생성 완료 (__sample: true 플래그로 구분됨)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

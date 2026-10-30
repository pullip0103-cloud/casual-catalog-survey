import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
  }),
});
const db = getFirestore(app);

const { regions, branches } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "branches.json"), "utf8")
);

async function main() {
  console.log(`regions ${regions.length}개, branches ${branches.length}개 등록 시작`);

  const regionsCol = db.collection("survey_regions");
  const existingRegions = await regionsCol.get();
  for (const doc of existingRegions.docs) await doc.ref.delete();
  for (const name of regions) {
    await regionsCol.add({ name });
  }
  console.log(`survey_regions ${regions.length}개 등록 완료`);

  const branchesCol = db.collection("survey_branches");
  const existingBranches = await branchesCol.get();
  const batchSize = 400;
  for (let i = 0; i < existingBranches.docs.length; i += batchSize) {
    const batch = db.batch();
    existingBranches.docs.slice(i, i + batchSize).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  for (let i = 0; i < branches.length; i += batchSize) {
    const batch = db.batch();
    const chunk = branches.slice(i, i + batchSize);
    for (const b of chunk) {
      const ref = branchesCol.doc();
      batch.set(ref, {
        region: b.region,
        name: b.name,
        branchType: b.branchType,
        code: b.code,
      });
    }
    await batch.commit();
    console.log(`  ${Math.min(i + batchSize, branches.length)}/${branches.length}`);
  }

  console.log("완료");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jijeom = JSON.parse(fs.readFileSync(path.join(__dirname, "jijeom_raw.json"), "utf8"));
const daeri = JSON.parse(fs.readFileSync(path.join(__dirname, "daeri_raw.json"), "utf8"));

const REGION_NAMES = [
  "강원", "경기", "경남", "대구경북", "대전",
  "동부", "부산", "서부", "인천", "전남광주",
  "전북", "충청", "남부",
];

function normalizeRegion(region) {
  return region.endsWith("지역본부") ? region : `${region}지역본부`;
}

const branches = [];

for (const row of jijeom) {
  if (!REGION_NAMES.includes(row.region)) continue; // "거점 개수" 등 헤더 오추출 제외
  if (!row.name || !row.code) continue;
  branches.push({
    region: normalizeRegion(row.region),
    name: row.name,
    branchType: "지점",
    code: row.code,
  });
}

for (const row of daeri) {
  if (!REGION_NAMES.includes(row.region)) continue;
  if (!row.name || !row.code) continue;
  branches.push({
    region: normalizeRegion(row.region),
    name: row.name,
    branchType: "대리점",
    code: row.code,
  });
}

const regions = REGION_NAMES.map(normalizeRegion).sort();

const outPath = path.join(__dirname, "branches.json");
fs.writeFileSync(outPath, JSON.stringify({ regions, branches }, null, 2));

console.log(`지역본부 ${regions.length}개, 거점 ${branches.length}개 (지점 ${branches.filter(b => b.branchType === "지점").length} / 대리점 ${branches.filter(b => b.branchType === "대리점").length})`);
console.log(`저장: ${outPath}`);

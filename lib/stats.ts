import type { Awareness, BranchType, Q1A, Q1AReason, Q1C, Q1CRatio } from "@/lib/types";

export interface RawResponse {
  region: string;
  branchType: BranchType;
  branchName: string;
  awareness: Awareness;
  q1a: Q1A;
  q1aReason?: Q1AReason;
  q1aReasonOther?: string;
  q1c: Q1C;
  q1cRatio?: Q1CRatio;
  generalComment?: string;
}

export interface AttributedText {
  region: string;
  branchName: string;
  branchType: BranchType;
  text: string;
}

export interface StatsBucket {
  total: number;
  awareness: Record<Awareness, number>;
  q1a: Record<Q1A, number>;
  q1aReason: Record<Q1AReason, number>;
  q1aReasonOtherTexts: AttributedText[];
  q1c: Record<Q1C, number>;
  q1cRatio: Record<Q1CRatio, number>;
  generalComments: AttributedText[];
}

function emptyBucket(): StatsBucket {
  return {
    total: 0,
    awareness: { used_in_response: 0, aware_not_used: 0, unaware: 0 },
    q1a: {
      very_helpful: 0,
      somewhat_helpful: 0,
      neutral: 0,
      not_very_helpful: 0,
      not_helpful_at_all: 0,
    },
    q1aReason: { fewer_pages: 0, thin_material: 0, other: 0 },
    q1aReasonOtherTexts: [],
    q1c: { hq_decide: 0, branch_ratio: 0 },
    q1cRatio: { "95_5": 0, "90_10": 0, "70_30": 0 },
    generalComments: [],
  };
}

function sortAttributed(items: AttributedText[]): AttributedText[] {
  return [...items].sort((a, b) => {
    if (a.region !== b.region) return a.region.localeCompare(b.region, "ko");
    if (a.branchType !== b.branchType) return a.branchType === "지점" ? -1 : 1;
    return a.branchName.localeCompare(b.branchName, "ko");
  });
}

export function aggregate(responses: RawResponse[]): StatsBucket {
  const bucket = emptyBucket();
  for (const r of responses) {
    bucket.total += 1;
    bucket.awareness[r.awareness] += 1;
    bucket.q1a[r.q1a] += 1;
    if (r.q1aReason) bucket.q1aReason[r.q1aReason] += 1;
    if (r.q1aReason === "other" && r.q1aReasonOther) {
      bucket.q1aReasonOtherTexts.push({
        region: r.region,
        branchName: r.branchName,
        branchType: r.branchType,
        text: r.q1aReasonOther,
      });
    }
    bucket.q1c[r.q1c] += 1;
    if (r.q1cRatio) bucket.q1cRatio[r.q1cRatio] += 1;
    if (r.generalComment) {
      bucket.generalComments.push({
        region: r.region,
        branchName: r.branchName,
        branchType: r.branchType,
        text: r.generalComment,
      });
    }
  }
  bucket.q1aReasonOtherTexts = sortAttributed(bucket.q1aReasonOtherTexts);
  bucket.generalComments = sortAttributed(bucket.generalComments);
  return bucket;
}

export interface StatsResult {
  all: StatsBucket;
  byBranchType: Record<BranchType, StatsBucket>;
}

export function buildStatsResult(responses: RawResponse[]): StatsResult {
  return {
    all: aggregate(responses),
    byBranchType: {
      지점: aggregate(responses.filter((r) => r.branchType === "지점")),
      대리점: aggregate(responses.filter((r) => r.branchType === "대리점")),
    },
  };
}

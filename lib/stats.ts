import type { Awareness, BranchType, Q1A, Q1C, Q1CRatio } from "@/lib/types";

export interface RawResponse {
  region: string;
  branchType: BranchType;
  awareness: Awareness;
  q1a: Q1A;
  q1c: Q1C;
  q1cRatio?: Q1CRatio;
}

export interface StatsBucket {
  total: number;
  awareness: Record<Awareness, number>;
  q1a: Record<Q1A, number>;
  q1c: Record<Q1C, number>;
  q1cRatio: Record<Q1CRatio, number>;
}

function emptyBucket(): StatsBucket {
  return {
    total: 0,
    awareness: { aware: 0, unaware: 0 },
    q1a: { good: 0, bad: 0, other: 0 },
    q1c: { hq_decide: 0, branch_ratio: 0 },
    q1cRatio: { "90_10": 0, "80_20": 0, "70_30": 0 },
  };
}

export function aggregate(responses: RawResponse[]): StatsBucket {
  const bucket = emptyBucket();
  for (const r of responses) {
    bucket.total += 1;
    bucket.awareness[r.awareness] += 1;
    bucket.q1a[r.q1a] += 1;
    bucket.q1c[r.q1c] += 1;
    if (r.q1cRatio) bucket.q1cRatio[r.q1cRatio] += 1;
  }
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

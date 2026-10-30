export type BranchType = "지점" | "대리점";

export interface Branch {
  id: string;
  region: string;
  name: string;
  branchType: BranchType;
  code: string;
}

export type Awareness = "aware" | "unaware";
export type Q1A = "good" | "bad" | "other";
export type Q1C = "hq_decide" | "branch_ratio";
export type Q1CRatio = "90_10" | "80_20" | "70_30";

export interface SurveyAnswers {
  awareness: Awareness;
  q1a: Q1A;
  q1aOther?: string;
  q1c: Q1C;
  q1cRatio?: Q1CRatio;
}

export interface SurveyResponse extends SurveyAnswers {
  id: string;
  region: string;
  branchType: BranchType;
  branchName: string;
  createdAt: string;
}

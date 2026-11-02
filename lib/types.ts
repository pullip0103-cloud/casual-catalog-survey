export type BranchType = "지점" | "대리점";

export interface Branch {
  id: string;
  region: string;
  name: string;
  branchType: BranchType;
  code: string;
}

export type Awareness = "used_in_response" | "aware_not_used" | "unaware";
export type Q1A = "very_helpful" | "somewhat_helpful" | "neutral" | "not_very_helpful" | "not_helpful_at_all";
export type Q1AReason = "fewer_pages" | "thin_material" | "other";
export type Q1C = "hq_decide" | "branch_ratio";
export type Q1CRatio = "95_5" | "90_10" | "70_30";

export interface SurveyAnswers {
  awareness: Awareness;
  q1a: Q1A;
  q1aReason?: Q1AReason;
  q1aReasonOther?: string;
  q1c: Q1C;
  q1cRatio?: Q1CRatio;
  generalComment?: string;
}

export interface SurveyResponse extends SurveyAnswers {
  id: string;
  region: string;
  branchType: BranchType;
  branchName: string;
  createdAt: string;
}

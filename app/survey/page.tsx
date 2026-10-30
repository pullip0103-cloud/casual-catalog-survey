"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Q1A, Q1B, Q1C, Q1CRatio, BranchType } from "@/lib/types";

type Step =
  | "intro"
  | "region"
  | "branchType"
  | "branch"
  | "code"
  | "questions"
  | "done";

interface BranchOption {
  id: string;
  name: string;
}

export default function SurveyPage() {
  const [step, setStep] = useState<Step>("intro");

  const [regions, setRegions] = useState<string[]>([]);
  const [region, setRegion] = useState<string | null>(null);
  const [branchType, setBranchType] = useState<BranchType | null>(null);

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [q1a, setQ1a] = useState<Q1A | null>(null);
  const [q1aOther, setQ1aOther] = useState("");
  const [q1b, setQ1b] = useState<Q1B | null>(null);
  const [q1c, setQ1c] = useState<Q1C | null>(null);
  const [q1cRatio, setQ1cRatio] = useState<Q1CRatio | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then((data) => setRegions(data.regions ?? []));
  }, []);

  useEffect(() => {
    if (!region || !branchType) return;
    fetch(`/api/branches?region=${encodeURIComponent(region)}&branchType=${encodeURIComponent(branchType)}`)
      .then((r) => r.json())
      .then((data) => setBranches(data.branches ?? []));
  }, [region, branchType]);

  async function handleVerifyCode() {
    if (!branchId || !code.trim()) {
      setCodeError("코드를 입력해주세요.");
      return;
    }
    setVerifying(true);
    setCodeError(null);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, code: code.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setStep("questions");
      } else {
        setCodeError("지점/대리점 코드를 다시 확인해주세요.");
      }
    } catch {
      setCodeError("확인 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit() {
    if (!branchId || !q1a || !q1b) return;
    if (q1a === "other" && !q1aOther.trim()) {
      setSubmitError("기타 의견을 입력해주세요.");
      return;
    }
    if (q1b === "helpful" && !q1c) {
      setSubmitError("다 항목에 응답해주세요.");
      return;
    }
    if (q1c === "branch_ratio" && !q1cRatio) {
      setSubmitError("비중을 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          code: code.trim(),
          q1a,
          q1aOther: q1a === "other" ? q1aOther.trim() : undefined,
          q1b,
          q1c: q1b === "helpful" ? q1c : undefined,
          q1cRatio: q1c === "branch_ratio" ? q1cRatio : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "제출 중 오류가 발생했습니다.");
        return;
      }
      setStep("done");
    } catch {
      setSubmitError("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg">
        {step === "intro" && (
          <section className="space-y-6">
            <h1 className="text-xl font-bold">캐쥬얼 카탈로그 설문조사</h1>
            <div className="rounded-lg bg-white border border-slate-200 p-5 text-sm leading-relaxed text-slate-700 space-y-2">
              <p className="font-semibold text-slate-900">[캐쥬얼 카탈로그란?]</p>
              <p>
                캐쥬얼 카탈로그는 기존 카탈로그의 수량 부족 문제를 해결하기 위해, 상대적으로
                얇고 적은 페이지수(4페이지)를 통해 비용은 절감하고 수량은 늘린 제작물입니다.
              </p>
              <p>
                정식 카탈로그 1부 비용으로 약 4부의 캐쥬얼 카탈로그를 제작할 수 있습니다
                (쏘렌토, 카니발, 스포티지 한정).
              </p>
              <p>
                지점에서 쏘렌토 카탈로그 100부만큼의 예산을 신청했다면, 본사에서는 80부의
                카탈로그만 제작하고, 나머지 20부만큼의 예산으로 캐쥬얼 카탈로그를 80부
                추가 제작해서 배포합니다.
              </p>
              <div className="pt-2">
                <Image
                  src="/catalog/sorento-casual-catalog.png"
                  alt="쏘렌토 캐쥬얼 카탈로그 예시"
                  width={920}
                  height={540}
                  className="w-full rounded-md border border-slate-200"
                />
              </div>
            </div>
            <button
              onClick={() => setStep("region")}
              className="w-full rounded-lg bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-700"
            >
              설문 시작하기
            </button>
          </section>
        )}

        {step === "region" && (
          <StepShell title="소속 지역본부를 선택해주세요" onBack={() => setStep("intro")}>
            <OptionGrid
              options={regions}
              onSelect={(r) => {
                setRegion(r);
                setBranches([]);
                setBranchId(null);
                setStep("branchType");
              }}
            />
          </StepShell>
        )}

        {step === "branchType" && (
          <StepShell title={`${region} — 구분을 선택해주세요`} onBack={() => setStep("region")}>
            <OptionGrid
              options={["지점", "대리점"]}
              onSelect={(t) => {
                setBranchType(t as BranchType);
                setBranches([]);
                setBranchId(null);
                setStep("branch");
              }}
            />
          </StepShell>
        )}

        {step === "branch" && (
          <StepShell
            title={`${region} ${branchType} — 소속 거점을 선택해주세요`}
            onBack={() => setStep("branchType")}
          >
            {branches.length === 0 ? (
              <p className="text-sm text-slate-400">불러오는 중...</p>
            ) : (
              <OptionGrid
                options={branches.map((b) => b.name)}
                onSelect={(name) => {
                  const found = branches.find((b) => b.name === name);
                  if (!found) return;
                  setBranchId(found.id);
                  setBranchName(found.name);
                  setStep("code");
                }}
              />
            )}
          </StepShell>
        )}

        {step === "code" && (
          <StepShell
            title={`${region} ${branchType} ${branchName} — 본인 확인`}
            onBack={() => setStep("branch")}
          >
            <p className="text-sm text-slate-600 mb-3">
              지점/대리점 코드를 입력해주세요.(대소문자 구분은 없습니다)
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setCodeError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerifyCode();
              }}
              placeholder="예: CA1"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}
            <button
              onClick={handleVerifyCode}
              disabled={verifying}
              className="mt-4 w-full rounded-lg bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-700 disabled:opacity-50"
            >
              {verifying ? "확인 중..." : "확인"}
            </button>
          </StepShell>
        )}

        {step === "questions" && (
          <StepShell
            title="질문 1. 캐쥬얼 카탈로그 효용성"
            onBack={() => setStep("code")}
          >
            <div className="space-y-8">
              <QuestionBlock label="가. 캐쥬얼 카탈로그를 잘 활용하고 계신가요?">
                <RadioOption
                  checked={q1a === "good"}
                  onChange={() => setQ1a("good")}
                  label="카탈로그가 부족했는데, 캐쥬얼 카탈로그라도 고객에게 드릴 수 있으니 좋은 것 같다."
                />
                <RadioOption
                  checked={q1a === "bad"}
                  onChange={() => setQ1a("bad")}
                  label="캐쥬얼 카탈로그는 페이지수도 적고 얇은 재질이다보니 고객에게 전달하기가 적절하지 않다."
                />
                <RadioOption checked={q1a === "other"} onChange={() => setQ1a("other")} label="기타 의견" />
                {q1a === "other" && (
                  <textarea
                    value={q1aOther}
                    onChange={(e) => setQ1aOther(e.target.value)}
                    placeholder="의견을 입력해주세요"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={3}
                  />
                )}
              </QuestionBlock>

              <QuestionBlock label="나. 캐쥬얼 카탈로그는 현장에 도움이 되나요?">
                <RadioOption
                  checked={q1b === "helpful"}
                  onChange={() => setQ1b("helpful")}
                  label="도움이 된다. 유지했으면 좋겠다."
                />
                <RadioOption
                  checked={q1b === "not_helpful"}
                  onChange={() => {
                    setQ1b("not_helpful");
                    setQ1c(null);
                    setQ1cRatio(null);
                  }}
                  label="도움이 안된다. 차라리 부족하더라도 공식 카탈로그만 쓰게 된다."
                />
              </QuestionBlock>

              {q1b === "helpful" && (
                <QuestionBlock label="다. 캐쥬얼 카탈로그는 어떤 식으로 배포하는 것이 좋을까요?">
                  <RadioOption
                    checked={q1c === "hq_decide"}
                    onChange={() => {
                      setQ1c("hq_decide");
                      setQ1cRatio(null);
                    }}
                    label="지금처럼 차종별 예산으로 신청하면, 본사에서 알아서 공식/캐쥬얼 카탈로그 수량을 정해주면 좋겠다."
                  />
                  <RadioOption
                    checked={q1c === "branch_ratio"}
                    onChange={() => setQ1c("branch_ratio")}
                    label="거점마다 캐쥬얼 카탈로그 비중을 정할 수 있으면 좋겠다."
                  />
                  {q1c === "branch_ratio" && (
                    <div className="mt-3 rounded-lg bg-slate-100 p-4 space-y-2">
                      <p className="text-xs text-slate-500">
                        공식 카탈로그 1부 제작 예산으로 캐쥬얼 카탈로그 4부를 제작할 수 있습니다.
                      </p>
                      <RadioOption
                        checked={q1cRatio === "80_20"}
                        onChange={() => setQ1cRatio("80_20")}
                        label="현재: 80% : 20% (쏘렌토 100부 신청 시 공식 80부 + 캐쥬얼 80부)"
                      />
                      <RadioOption
                        checked={q1cRatio === "90_10"}
                        onChange={() => setQ1cRatio("90_10")}
                        label="선택 1: 90% : 10% (공식 90부 + 캐쥬얼 40부)"
                      />
                      <RadioOption
                        checked={q1cRatio === "70_30"}
                        onChange={() => setQ1cRatio("70_30")}
                        label="선택 3: 70% : 30% (공식 70부 + 캐쥬얼 90부)"
                      />
                    </div>
                  )}
                </QuestionBlock>
              )}

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <button
                onClick={handleSubmit}
                disabled={submitting || !q1a || !q1b}
                className="w-full rounded-lg bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-700 disabled:opacity-50"
              >
                {submitting ? "제출 중..." : "제출하기"}
              </button>
            </div>
          </StepShell>
        )}

        {step === "done" && (
          <section className="space-y-6 text-center py-12">
            <h1 className="text-xl font-bold">응답이 제출되었습니다</h1>
            <p className="text-sm text-slate-500">소중한 의견 감사합니다.</p>
            <Link href="/" className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-white font-medium">
              처음으로
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

function StepShell({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-700 text-sm">
          ← 이전
        </button>
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function OptionGrid({ options, onSelect }: { options: string[]; onSelect: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium hover:border-slate-900 hover:bg-slate-50"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function QuestionBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-900">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RadioOption({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm cursor-pointer ${
        checked ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <input type="radio" checked={checked} onChange={onChange} className="mt-0.5" />
      <span>{label}</span>
    </label>
  );
}

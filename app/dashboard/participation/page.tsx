"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { BranchType } from "@/lib/types";

interface TypeCount {
  total: number;
  responded: number;
}

interface BranchParticipation {
  name: string;
  branchType: BranchType;
  responded: boolean;
}

interface RegionParticipation {
  total: number;
  responded: number;
  byType: Record<BranchType, TypeCount>;
  branches: BranchParticipation[];
}

interface ApiResponse {
  national: RegionParticipation;
  byRegion: Record<string, RegionParticipation>;
}

function pct(responded: number, total: number) {
  return total > 0 ? Math.round((responded / total) * 100) : 0;
}

function BranchTypeSection({ label, branches }: { label: string; branches: BranchParticipation[] }) {
  if (branches.length === 0) return null;
  const responded = branches.filter((b) => b.responded).length;

  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-2">
        {label} — 응답 {responded} / {branches.length}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {branches.map((b) => (
          <span
            key={b.name}
            className={`rounded text-xs px-2 py-1 ${
              b.responded ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ParticipationPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/stats/participation")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const regionNames = useMemo(() => (data ? Object.keys(data.byRegion).sort() : []), [data]);

  if (!data) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-slate-400">불러오는 중...</p>
      </main>
    );
  }

  function toggle(region: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-4xl w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">설문 참여 현황</h1>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          ← 결과 대시보드로
        </Link>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        <span className="inline-block w-3 h-3 rounded-sm align-middle mr-1 bg-red-50" style={{ border: "1px solid #fecaca" }} />
        응답 완료
        <span className="inline-block w-3 h-3 rounded-sm align-middle mr-1 ml-3 bg-blue-50" style={{ border: "1px solid #bfdbfe" }} />
        미응답
      </p>

      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-500 mb-2">전국 전체</p>
        <p className="text-2xl font-bold">
          {data.national.responded} / {data.national.total}
          <span className="text-sm font-normal text-slate-400 ml-2">
            ({pct(data.national.responded, data.national.total)}% 참여)
          </span>
        </p>
        <div className="mt-3 flex gap-6 text-sm text-slate-600">
          <span>
            지점 {data.national.byType.지점.responded} / {data.national.byType.지점.total} (
            {pct(data.national.byType.지점.responded, data.national.byType.지점.total)}%)
          </span>
          <span>
            대리점 {data.national.byType.대리점.responded} / {data.national.byType.대리점.total} (
            {pct(data.national.byType.대리점.responded, data.national.byType.대리점.total)}%)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {regionNames.map((region) => {
          const r = data.byRegion[region];
          const isOpen = expanded.has(region);

          return (
            <div key={region} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <button
                onClick={() => toggle(region)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{region}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    지점 {r.byType.지점.responded}/{r.byType.지점.total} · 대리점{" "}
                    {r.byType.대리점.responded}/{r.byType.대리점.total}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    {r.responded} / {r.total} ({pct(r.responded, r.total)}%)
                  </span>
                  <span className="text-slate-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-4">
                  <BranchTypeSection label="지점" branches={r.branches.filter((b) => b.branchType === "지점")} />
                  <BranchTypeSection label="대리점" branches={r.branches.filter((b) => b.branchType === "대리점")} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

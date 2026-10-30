"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatsBucket, StatsResult } from "@/lib/stats";

const COLORS = ["#2563eb", "#f97316", "#64748b", "#16a34a", "#dc2626"];

const Q1A_LABELS: Record<string, string> = { good: "좋다", bad: "안좋다", other: "기타" };
const Q1B_LABELS: Record<string, string> = { helpful: "도움됨", not_helpful: "도움안됨" };
const Q1C_LABELS: Record<string, string> = { hq_decide: "본사 결정", branch_ratio: "거점별 비중" };
const Q1CRATIO_LABELS: Record<string, string> = { "90_10": "90:10", "80_20": "80:20(현재)", "70_30": "70:30" };

type BranchFilter = "전체" | "지점" | "대리점";

interface ApiResponse {
  national: StatsResult;
  byRegion: Record<string, StatsResult>;
}

function pickBucket(result: StatsResult, filter: BranchFilter): StatsBucket {
  if (filter === "전체") return result.all;
  return result.byBranchType[filter];
}

function toChartData(record: Record<string, number>, labels: Record<string, string>) {
  return Object.entries(record).map(([key, value]) => ({ name: labels[key] ?? key, value }));
}

export default function DashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [scope, setScope] = useState<"national" | string>("national");
  const [branchFilter, setBranchFilter] = useState<BranchFilter>("전체");

  useEffect(() => {
    fetch("/api/stats/national")
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

  const result = scope === "national" ? data.national : data.byRegion[scope];
  const bucket = result ? pickBucket(result, branchFilter) : null;

  return (
    <main className="flex flex-1 flex-col px-6 py-10 max-w-4xl w-full mx-auto">
      <h1 className="text-xl font-bold mb-6">캐쥬얼 카탈로그 설문 결과</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
        >
          <option value="national">전국</option>
          {regionNames.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg border border-slate-300 overflow-hidden">
          {(["전체", "지점", "대리점"] as BranchFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setBranchFilter(f)}
              className={`px-4 py-2 text-sm ${
                branchFilter === f ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!bucket || bucket.total === 0 ? (
        <p className="text-slate-400 text-sm">응답 데이터가 없습니다.</p>
      ) : (
        <div className="space-y-10">
          <p className="text-sm text-slate-500">총 응답 수: {bucket.total}건</p>

          <ChartSection title="가. 캐쥬얼 카탈로그 활용 만족도" data={toChartData(bucket.q1a, Q1A_LABELS)} />
          {scope === "national" && (
            <RegionTypeTable
              title="가. 캐쥬얼 카탈로그 활용 만족도"
              regionNames={regionNames}
              byRegion={data.byRegion}
              getRecord={(b) => b.q1a}
              labels={Q1A_LABELS}
            />
          )}

          <ChartSection title="나. 현장 도움 여부" data={toChartData(bucket.q1b, Q1B_LABELS)} />
          {scope === "national" && (
            <RegionTypeTable
              title="나. 현장 도움 여부"
              regionNames={regionNames}
              byRegion={data.byRegion}
              getRecord={(b) => b.q1b}
              labels={Q1B_LABELS}
            />
          )}

          {(bucket.q1c.hq_decide + bucket.q1c.branch_ratio) > 0 && (
            <>
              <ChartSection title="다. 배포 방식 선호" data={toChartData(bucket.q1c, Q1C_LABELS)} />
              {scope === "national" && (
                <RegionTypeTable
                  title="다. 배포 방식 선호"
                  regionNames={regionNames}
                  byRegion={data.byRegion}
                  getRecord={(b) => b.q1c}
                  labels={Q1C_LABELS}
                />
              )}
            </>
          )}

          {(bucket.q1cRatio["90_10"] + bucket.q1cRatio["80_20"] + bucket.q1cRatio["70_30"]) > 0 && (
            <>
              <ChartSection title="캐쥬얼 카탈로그 비중 선호" data={toChartData(bucket.q1cRatio, Q1CRATIO_LABELS)} />
              {scope === "national" && (
                <RegionTypeTable
                  title="캐쥬얼 카탈로그 비중 선호"
                  regionNames={regionNames}
                  byRegion={data.byRegion}
                  getRecord={(b) => b.q1cRatio}
                  labels={Q1CRATIO_LABELS}
                />
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}

function RegionTypeTable({
  title,
  regionNames,
  byRegion,
  getRecord,
  labels,
}: {
  title: string;
  regionNames: string[];
  byRegion: Record<string, StatsResult>;
  getRecord: (bucket: StatsBucket) => Record<string, number>;
  labels: Record<string, string>;
}) {
  const keys = Object.keys(labels);
  const columns: { key: string; label: string; filter: BranchFilter }[] = [
    { key: "전체", label: "전체", filter: "전체" },
    { key: "지점", label: "지점", filter: "지점" },
    { key: "대리점", label: "대리점", filter: "대리점" },
  ];

  return (
    <div className="-mt-4">
      <p className="text-xs text-slate-400 mb-2">{title} — 지역본부별 상세</p>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="px-3 py-2 text-left font-medium">지역본부</th>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 text-left font-medium" colSpan={keys.length + 1}>
                  {col.label}
                </th>
              ))}
            </tr>
            <tr className="bg-slate-50 text-slate-400">
              <th className="px-3 py-1"></th>
              {columns.map((col) => (
                <Fragment key={col.key}>
                  {keys.map((k) => (
                    <th key={`${col.key}-${k}`} className="px-2 py-1 text-right whitespace-nowrap">
                      {labels[k]}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-right whitespace-nowrap font-medium">
                    합계
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {regionNames.map((region) => {
              const result = byRegion[region];
              return (
                <tr key={region} className="border-t border-slate-100">
                  <td className="px-3 py-2 whitespace-nowrap text-slate-700">{region}</td>
                  {columns.map((col) => {
                    const bucket = col.filter === "전체" ? result?.all : result?.byBranchType[col.filter];
                    const record = bucket ? getRecord(bucket) : undefined;
                    const total = record ? keys.reduce((sum, k) => sum + (record[k] ?? 0), 0) : 0;
                    return (
                      <Fragment key={col.key}>
                        {keys.map((k) => {
                          const value = record?.[k] ?? 0;
                          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                          return (
                            <td key={`${col.key}-${k}`} className="px-2 py-2 text-right text-slate-600 whitespace-nowrap">
                              {value}
                              {total > 0 && <span className="text-slate-400"> ({pct}%)</span>}
                            </td>
                          );
                        })}
                        <td className="px-2 py-2 text-right font-medium text-slate-900">
                          {total}
                        </td>
                      </Fragment>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChartSection({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {filtered.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={filtered} dataKey="value" nameKey="name" outerRadius={80} label>
                {filtered.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

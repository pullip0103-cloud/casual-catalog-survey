"use client";

import Link from "next/link";
import ParticipationView from "@/app/components/ParticipationView";

export default function ParticipationPage() {
  return (
    <ParticipationView
      headerRight={
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
        >
          ← 결과 대시보드로
        </Link>
      }
    />
  );
}

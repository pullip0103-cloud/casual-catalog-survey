import Link from "next/link";

// 통계 대시보드(/dashboard)는 현장 설문 화면에 노출하지 않는다 — 별도 URL로만 안내.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold">캐쥬얼 카탈로그 설문조사</h1>
        <p className="mt-2 text-sm text-slate-500">13개 지역본부 지점·대리점 대상</p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/survey"
          className="rounded-lg bg-slate-900 px-6 py-4 text-center text-white font-medium hover:bg-slate-700"
        >
          설문 참여하기
        </Link>
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function SurveyPreviewPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700 text-sm">
            ← 대시보드로
          </Link>
        </div>
        <div>
          <h1 className="text-xl font-bold">설문조사 내용 미리보기</h1>
          <p className="mt-1 text-sm text-slate-500">
            실제 응답은 하실 수 없으며, 질문 내용만 확인하는 화면입니다.
          </p>
        </div>

        <div className="rounded-lg bg-white border border-slate-200 p-5 text-sm leading-relaxed text-slate-700 space-y-2">
          <p className="font-semibold text-slate-900">[캐쥬얼 카탈로그란?]</p>
          <p>
            캐쥬얼 카탈로그는 기존 카탈로그의 수량 부족 문제를 해결하기 위해, 상대적으로
            얇고 적은 페이지수(4페이지)를 통해 비용은 절감하고 수량은 늘린 제작물입니다.
          </p>
          <p>
            일반 카탈로그 1부 비용으로 약 4부의 캐쥬얼 카탈로그를 제작할 수 있습니다
            (쏘렌토, 카니발, 스포티지 한정).
          </p>
          <p>
            지점에서 쏘렌토 카탈로그 100부만큼의 예산을 신청했다면, 본사에서는 80부의
            카탈로그만 제작하고, 나머지 20부만큼의 예산으로 캐쥬얼 카탈로그를 80부
            추가 제작해서 배포합니다.
          </p>
          <div className="pt-2 space-y-2">
            <Image
              src="/catalog/sorento-casual-catalog.png"
              alt="쏘렌토 캐쥬얼 카탈로그 예시 앞면"
              width={920}
              height={540}
              className="w-full rounded-md border border-slate-200"
            />
            <Image
              src="/catalog/sorento-casual-catalog-2.png"
              alt="쏘렌토 캐쥬얼 카탈로그 예시 뒷면"
              width={920}
              height={540}
              className="w-full rounded-md border border-slate-200"
            />
          </div>
        </div>

        <PreviewBlock label="캐쥬얼 카탈로그를 알고 계신가요?">
          <PreviewOption label="알고 있다" />
          <PreviewOption label="모른다" />
        </PreviewBlock>

        <PreviewBlock label="가. 캐쥬얼 카탈로그를 잘 활용하고 계신가요?">
          <PreviewOption label="카탈로그가 부족했는데, 캐쥬얼 카탈로그라도 고객에게 드릴 수 있으니 좋은 것 같다." />
          <PreviewOption label="캐쥬얼 카탈로그는 페이지수도 적고 얇은 재질이다보니 고객에게 전달하기가 적절하지 않다." />
          <PreviewOption label="기타 의견 (주관식 입력)" />
        </PreviewBlock>

        <PreviewBlock label="나. 캐쥬얼 카탈로그는 어떤 식으로 배포하는 것이 좋을까요?">
          <p className="text-xs text-slate-500 -mt-1 mb-1">
            일반 카탈로그 1부 제작 예산으로 캐쥬얼 카탈로그 4부를 제작할 수 있습니다.
          </p>
          <PreviewOption
            label="지금처럼 차종별 예산에서 일반 카탈로그 / 캐쥬얼 카탈로그 비율 80% / 20%가 적절하다."
            description="예시) 100부 예산 신청 시 일반 80부 + 캐쥬얼 80부"
          />
          <PreviewOption label="비중 조정이 필요하다." />
          <div className="mt-1 rounded-lg bg-slate-100 p-4 space-y-2">
            <p className="text-xs text-slate-500">
              ↳ &quot;비중 조정이 필요하다&quot; 선택 시 노출되는 하위 질문
            </p>
            <PreviewOption label="선택 1: 95% : 5%" description="예시) 100부 예산 신청 시 일반 95부 + 캐쥬얼 20부" />
            <PreviewOption label="선택 2: 90% : 10%" description="예시) 100부 예산 신청 시 일반 90부 + 캐쥬얼 40부" />
            <PreviewOption label="선택 3: 70% : 30%" description="예시) 100부 예산 신청 시 일반 70부 + 캐쥬얼 120부" />
          </div>
        </PreviewBlock>
      </div>
    </main>
  );
}

function PreviewBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-900">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PreviewOption({ label, description }: { label: string; description?: string }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
      <input type="radio" disabled className="mt-0.5" />
      <span>
        {label}
        {description && <span className="block mt-1 text-xs text-slate-400">{description}</span>}
      </span>
    </label>
  );
}

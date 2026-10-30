import pptxgen from "pptxgenjs";

const FONT_BOLD = "Kia Signature OTF Bold";
const FONT_REGULAR = "Kia Signature OTF Regular";
const FONT_LIGHT = "Kia Signature OTF Light";

const pptx = new pptxgen();
pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
pptx.layout = "WIDE";

function titleSlide(title, subtitle) {
  const slide = pptx.addSlide();
  slide.addText(title, {
    x: 0.6, y: 0.5, w: 12.1, h: 1,
    fontFace: FONT_BOLD, fontSize: 28, color: "1A1A1A",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: 1.3, w: 12.1, h: 0.5,
      fontFace: FONT_LIGHT, fontSize: 14, color: "888888",
    });
  }
  return slide;
}

// 1. 인트로 안내문
{
  const slide = titleSlide("설문 시작 화면 — 안내 문구", "[캐쥬얼 카탈로그란?]");
  slide.addText(
    [
      { text: "캐쥬얼 카탈로그는 기존 카탈로그의 수량 부족 문제를 해결하기 위해, 상대적으로 얇고 적은 페이지수를 통해 비용은 절감하고 수량은 늘린 제작물입니다.\n\n", options: {} },
      { text: "정식 카탈로그 1부 비용으로 약 4부의 캐쥬얼 카탈로그를 제작할 수 있습니다(쏘렌토, 카니발, 스포티지 한정).\n\n", options: {} },
      { text: "지점에서 쏘렌토 카탈로그 100부만큼의 예산을 신청했다면, 본사에서는 80부의 카탈로그만 제작하고, 나머지 20부만큼의 예산으로 캐쥬얼 카탈로그를 80부 추가 제작해서 배포합니다.", options: {} },
    ],
    {
      x: 0.6, y: 2.0, w: 12.1, h: 3.5,
      fontFace: FONT_REGULAR, fontSize: 16, color: "333333",
      lineSpacingMultiple: 1.3, valign: "top",
    }
  );
  slide.addText("버튼: 설문 시작하기", {
    x: 0.6, y: 6.0, w: 6, h: 0.6,
    fontFace: FONT_REGULAR, fontSize: 13, color: "FFFFFF",
    fill: { color: "1A1A1A" }, align: "center", valign: "middle",
  });
}

// 2. 거점 코드 입력 안내
{
  const slide = titleSlide("거점 코드 입력 화면 — 안내 문구", "지역본부 → 구분 → 거점 선택 다음 단계");
  slide.addText("지점/대리점 코드를 입력해주세요.(대소문자 구분은 없습니다)", {
    x: 0.6, y: 2.2, w: 12.1, h: 0.6,
    fontFace: FONT_REGULAR, fontSize: 18, color: "333333",
  });
  slide.addText("※ 틀린 코드 입력 시 오류 메시지: \"지점/대리점 코드를 다시 확인해주세요.\"", {
    x: 0.6, y: 3.0, w: 12.1, h: 0.5,
    fontFace: FONT_LIGHT, fontSize: 13, color: "C0392B",
  });
}

// 3. 질문 1 가/나
{
  const slide = titleSlide("질문 1. 캐쥬얼 카탈로그 효용성", "가 / 나 항목");
  slide.addText("가. 캐쥬얼 카탈로그를 잘 활용하고 계신가요?", {
    x: 0.6, y: 1.9, w: 12.1, h: 0.5,
    fontFace: FONT_BOLD, fontSize: 16, color: "1A1A1A",
  });
  slide.addText(
    [
      { text: "①  ", options: { bold: true } },
      { text: "카탈로그가 부족해서 고객에게 무엇이라도 전달할 것이 없어 안좋았는데, 캐쥬얼 카탈로그라도 고객에게 드릴 수 있으니 좋은 것 같다.\n\n" },
      { text: "②  ", options: { bold: true } },
      { text: "캐쥬얼 카탈로그는 페이지수도 적고 얇은 재질이다보니 고객에게 전달하기가 기분상 좋지 않다.\n\n" },
      { text: "③  ", options: { bold: true } },
      { text: "기타 의견 (주관식 입력)" },
    ],
    {
      x: 0.9, y: 2.4, w: 11.8, h: 1.9,
      fontFace: FONT_REGULAR, fontSize: 14, color: "333333", lineSpacingMultiple: 1.25,
    }
  );

  slide.addText("나. 캐쥬얼 카탈로그는 현장에 도움이 되나요?", {
    x: 0.6, y: 4.5, w: 12.1, h: 0.5,
    fontFace: FONT_BOLD, fontSize: 16, color: "1A1A1A",
  });
  slide.addText(
    [
      { text: "①  ", options: { bold: true } },
      { text: "도움이 된다. 유지했으면 좋겠다.  → '다' 항목으로 진행\n\n" },
      { text: "②  ", options: { bold: true } },
      { text: "도움이 안된다. 차라리 그 예산으로 적으나마 공식 카탈로그를 몇부라도 더 주는게 낫다.  → '다' 항목 건너뛰고 제출" },
    ],
    {
      x: 0.9, y: 5.0, w: 11.8, h: 1.3,
      fontFace: FONT_REGULAR, fontSize: 14, color: "333333", lineSpacingMultiple: 1.25,
    }
  );
}

// 4. 질문 1 다
{
  const slide = titleSlide("질문 1. 캐쥬얼 카탈로그 효용성", "다 항목 — '나'에서 ①(도움이 된다) 선택 시에만 노출");
  slide.addText("다. 캐쥬얼 카탈로그는 어떤 식으로 배포하는 것이 좋을까요?", {
    x: 0.6, y: 1.9, w: 12.1, h: 0.5,
    fontFace: FONT_BOLD, fontSize: 16, color: "1A1A1A",
  });
  slide.addText(
    [
      { text: "①  ", options: { bold: true } },
      { text: "지금처럼 차종별 예산으로 신청하면, 본사에서 알아서 공식/캐쥬얼 카탈로그 수량을 정해주면 좋겠다.\n\n" },
      { text: "②  ", options: { bold: true } },
      { text: "거점마다 캐쥬얼 카탈로그 비중을 정할 수 있으면 좋겠다.  → 선택 시 하위 질문 노출" },
    ],
    {
      x: 0.9, y: 2.4, w: 11.8, h: 1.2,
      fontFace: FONT_REGULAR, fontSize: 14, color: "333333", lineSpacingMultiple: 1.25,
    }
  );

  slide.addText("② 선택 시 하위 질문", {
    x: 0.6, y: 3.8, w: 12.1, h: 0.4,
    fontFace: FONT_BOLD, fontSize: 14, color: "1A1A1A",
  });
  slide.addText("안내: 공식 카탈로그 1부 제작 예산으로 캐쥬얼 카탈로그 4부를 제작할 수 있습니다.", {
    x: 0.9, y: 4.25, w: 11.8, h: 0.4,
    fontFace: FONT_LIGHT, fontSize: 13, color: "888888",
  });
  slide.addText(
    [
      { text: "현재: 80% : 20%  (쏘렌토 100부 신청 시 공식 80부 + 캐쥬얼 80부)\n\n" },
      { text: "선택 1: 90% : 10%  (공식 90부 + 캐쥬얼 40부)\n\n" },
      { text: "선택 3: 70% : 30%  (공식 70부 + 캐쥬얼 90부)" },
    ],
    {
      x: 0.9, y: 4.75, w: 11.8, h: 1.8,
      fontFace: FONT_REGULAR, fontSize: 14, color: "333333", lineSpacingMultiple: 1.25,
    }
  );
}

// 5. 제출 완료 화면
{
  const slide = titleSlide("설문 제출 완료 화면", "");
  slide.addText("응답이 제출되었습니다", {
    x: 0.6, y: 2.2, w: 12.1, h: 0.6,
    fontFace: FONT_BOLD, fontSize: 20, color: "1A1A1A",
  });
  slide.addText("소중한 의견 감사합니다.", {
    x: 0.6, y: 2.9, w: 12.1, h: 0.5,
    fontFace: FONT_LIGHT, fontSize: 14, color: "888888",
  });
  slide.addText("버튼: 처음으로", {
    x: 0.6, y: 3.6, w: 4, h: 0.5,
    fontFace: FONT_REGULAR, fontSize: 12, color: "FFFFFF",
    fill: { color: "1A1A1A" }, align: "center", valign: "middle",
  });
}

const outPath = "C:/Onedrive_260729/Hyundai Motor and Kia/클로드/캐쥬얼 카탈로그 설문조사 문구.pptx";
await pptx.writeFile({ fileName: outPath });
console.log("저장 완료:", outPath);

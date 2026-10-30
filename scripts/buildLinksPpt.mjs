import pptxgen from "pptxgenjs";
import QRCode from "qrcode";

const FONT_BOLD = "Kia Signature OTF Bold";
const FONT_REGULAR = "Kia Signature OTF Regular";
const FONT_LIGHT = "Kia Signature OTF Light";

const SURVEY_URL = "https://casual-catalog-survey.onrender.com/survey";
const DASHBOARD_URL = "https://casual-catalog-survey.onrender.com/dashboard";

async function qrDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 500 });
}

const pptx = new pptxgen();
pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
pptx.layout = "WIDE";

function linkSlide(title, subtitle, url, qrImage, badgeColor) {
  const slide = pptx.addSlide();
  slide.addText(title, {
    x: 0.6, y: 0.6, w: 12.1, h: 0.8,
    fontFace: FONT_BOLD, fontSize: 28, color: "1A1A1A",
  });
  slide.addText(subtitle, {
    x: 0.6, y: 1.4, w: 12.1, h: 0.5,
    fontFace: FONT_LIGHT, fontSize: 14, color: "888888",
  });

  slide.addImage({ data: qrImage, x: 1.0, y: 2.2, w: 3.6, h: 3.6 });

  slide.addText(url, {
    x: 5.0, y: 3.3, w: 7.3, h: 0.6,
    fontFace: FONT_REGULAR, fontSize: 16, color: "1A1A1A",
    fill: { color: "F2F2F2" }, align: "left", valign: "middle",
    margin: 10,
  });

  return slide;
}

const surveyQr = await qrDataUrl(SURVEY_URL);
const dashboardQr = await qrDataUrl(DASHBOARD_URL);

linkSlide(
  "캐쥬얼 카탈로그 설문조사 — 참여 링크",
  "전국 지점/대리점 대상 — QR 스캔 또는 아래 주소로 접속",
  SURVEY_URL,
  surveyQr
);

linkSlide(
  "캐쥬얼 카탈로그 설문조사 — 결과 대시보드",
  "본사 전용 — 전국/지역본부별 통계 확인 (현장 화면에는 노출되지 않음)",
  DASHBOARD_URL,
  dashboardQr
);

const outPath = "C:/Onedrive_260729/Hyundai Motor and Kia/클로드/캐쥬얼 카탈로그 설문조사 링크.pptx";
await pptx.writeFile({ fileName: outPath });
console.log("저장 완료:", outPath);

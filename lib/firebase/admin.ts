import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// BMS 전수조사 웹앱(bms-fullcheck)과 같은 Firebase 프로젝트를 재사용한다 —
// 이 설문조사는 "survey_" 접두사가 붙은 별도 컬렉션만 사용해 데이터가 섞이지 않는다.
// 지연 초기화(lazy init): 빌드 시점에는 환경변수가 없어도 모듈 로드가 실패하지 않도록,
// 실제 API 요청에서 각 getter가 처음 호출될 때 초기화한다.
let app: App | null = null;

function getAdminApp(): App {
  if (app) return app;
  const apps = getApps();
  if (apps.length) {
    app = apps[0];
    return app;
  }
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    }),
  });
  return app;
}

let _db: Firestore | null = null;

function bindIfFunction(value: unknown, thisArg: unknown) {
  return typeof value === "function" ? value.bind(thisArg) : value;
}

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_target, prop) {
    if (!_db) _db = getFirestore(getAdminApp());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Admin SDK 메서드를 그대로 위임
    return bindIfFunction((_db as any)[prop], _db);
  },
});

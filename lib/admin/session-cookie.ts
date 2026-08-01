// 세션 쿠키 "이름" 상수만 담는 파일. lib/admin/session.ts는 이 이름 외에도
// lib/admin/env.ts(ADMIN_PASSWORD/ADMIN_SESSION_SECRET/SITE_URL을 즉시 Zod로 검증하는
// eager 초기화)와 next/headers(cookies())를 함께 끌고 온다.
//
// proxy.ts는 이제 서명 검증까지 수행하지만(Task 022 후속 결정, lib/admin/session-token.ts
// 상단 배경 참고), lib/admin/session.ts를 통째로 import하지 않고 이름 상수(이 파일)와
// 순수 서명 검증 로직(session-token.ts)만 가져온다 — lib/admin/env.ts를 통째로 끌어오면
// 관리자 환경변수가 하나라도(SITE_URL 등, 서명 검증과 무관한 값 포함) 비어 있을 때
// /admin/* 요청마다(로그인 페이지 포함) proxy 단계에서 예외가 발생해, 원래 (protected)
// 세그먼트에서만 나야 할 설정 오류가 라우팅 레이어까지 번지기 때문이다.
export const ADMIN_SESSION_COOKIE_NAME = "admin_session"

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin/session-cookie"
import { verifySessionToken } from "@/lib/admin/session-token"

// [Task 022 최종 결정] 처음엔 세션 쿠키 "존재 여부"만 확인했으나, code-reviewer 검증 결과
// 이름만 맞고 서명이 무효한(또는 만료된) 쿠키로 /admin에 접근하면 실제 HTTP 200 +
// AdminShell 뼈대가 응답되는 문제가 발견되어(원인·재현은 lib/admin/session-token.ts 상단
// 배경 참고) 여기서 서명·만료까지 검증하도록 강화했다. proxy는 Next.js 16에서 Node.js
// 런타임이 기본이라 node:crypto 사용에 기술적 제약이 없다(공식 문서 proxy.md "Runtime" 절).
//
// 그럼에도 이 proxy가 유일한 방어선은 아니다 — Next 공식 문서(proxy.md "Execution order"
// 하단)는 "matcher 변경이나 리팩터링으로 proxy 커버리지가 조용히 빠질 수 있으니, 각 Server
// Function 안에서도 반드시 인증을 재검증하라"고 명시한다. 그래서 app/admin/(protected)/
// page.tsx의 verifySession()을 인가 판정의 유일한 진실 공급원(심층 방어)으로 계속 유지한다
// — proxy를 우회해서(직접 RSC 요청 등) 이 세그먼트에 진입해도 verifySession()이 다시 막는다.
//
// lib/admin/session.ts를 통째로 import하지 않고 순수 검증 로직(session-token.ts)만
// 가져온다 — lib/admin/env.ts의 eager Zod 검증(ADMIN_PASSWORD/SITE_URL 등)이 /admin/*
// 요청마다 proxy 단계에서 함께 실행되는 걸 피하기 위함이다(session-cookie.ts 상단 주석
// 참고). ADMIN_SESSION_SECRET이 비어 있으면(설정 오류) verifySessionToken이 항상
// invalid를 반환하므로 자동으로 fail-closed(로그인 화면으로 리다이렉트)된다.
//
// 주의: ADMIN_SESSION_SECRET의 "32자 이상" 길이 요구사항은 lib/admin/env.ts의 Zod
// 스키마에서만 강제된다 — 여기서는 process.env를 직접 읽으므로 길이를 검사하지 않는다.
// 따라서 SECRET이 32자 미만으로 잘못 설정된 경우, proxy는 서명 검증 자체는 수학적으로
// 수행하지만(짧아도 HMAC은 성립), 로그인 시도 시 loginAction이 adminEnv를 로드하면서
// Zod 검증 실패로 500이 발생해 애초에 세션 쿠키가 발급되지 않는다 — 두 계층이 서로 다른
// env 접근 경로를 쓴다는 점을 디버깅 시 참고할 것.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // matcher가 "/admin"(zero segments)과 "/admin/login"도 포함하므로, 로그인 페이지
  // 자체는 여기서 그냥 통과시켜야 한다 — 그렇지 않으면 세션이 없을 때 로그인 화면으로
  // 리다이렉트하려는 시도가 다시 로그인 화면으로 리다이렉트되는 무한 루프에 빠진다.
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next()
  }

  const raw = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value
  const result = verifySessionToken(raw, process.env.ADMIN_SESSION_SECRET ?? "")

  if (!result.valid) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

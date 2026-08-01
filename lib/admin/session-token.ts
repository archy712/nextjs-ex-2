import { timingSafeEqual, createHmac } from "node:crypto"

import type { AdminSessionVerification } from "@/types/admin"

// 세션 토큰 서명/검증의 순수 로직. lib/admin/env.ts(ADMIN_PASSWORD/SITE_URL까지 eager
// Zod 검증)나 next/headers에 의존하지 않는다 — proxy.ts가 이 파일만 가져와 서명 검증을
// 수행하고(Task 022 후속 결정, 아래 배경 참고), lib/admin/session.ts는 실제 쿠키 읽기와
// adminEnv 연결을 담당한다.
//
// 배경: 최초 구현은 proxy.ts가 세션 쿠키 "존재 여부"만 확인했다. 그런데 이 (protected)
// 세그먼트는 cacheComponents(PPR) 대상이라, layout.tsx(AdminShell)가 정적 셸로 먼저 200
// 응답을 스트리밍하기 시작한 뒤에야 page.tsx의 verifySession()이 실패를 발견해 redirect()를
// 던진다 — 이 시점엔 HTTP 상태 코드를 이미 200으로 확정한 뒤라 Next.js가 실제 307 대신
// RSC 스트림에 클라이언트 전용 소프트 리다이렉트 신호만 심는다(Next.js 공식 문서
// functions/redirect.md "streaming context" 절에 명문화된 동작). 그 결과 curl 등 JS를
// 실행하지 않는 클라이언트는 이름만 맞고 서명은 무효한 쿠키로도 AdminShell 뼈대가 담긴
// 200 응답을 그대로 받았다(실제 견적서 데이터는 없었지만 "로그인 화면으로 리다이렉트"라는
// 수락 기준을 문언대로 충족하지 못함 — code-reviewer가 프로덕션 빌드로 재현/확인).
// proxy는 렌더링이 시작되기 전에 실행되므로, 여기서 서명까지 검증하면 위조/만료 쿠키도
// 진짜 307로 걸러낼 수 있다. verifySession()(lib/admin/session.ts)은 그대로 심층 방어로
// 유지한다 — proxy matcher 설정 실수나 향후 리팩터링으로 커버리지가 조용히 빠지는 상황에
// 대비하라는 Next 공식 권고를 따른다.
export function signSessionValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex")
}

export function createSessionToken(secret: string, maxAgeSeconds: number): string {
  const expiresAt = Date.now() + maxAgeSeconds * 1000
  return `${expiresAt}.${signSessionValue(String(expiresAt), secret)}`
}

// secret이 비어 있으면(환경변수 미설정) 어떤 토큰도 유효하게 판정하지 않는다(fail-closed).
export function verifySessionToken(
  raw: string | undefined,
  secret: string
): AdminSessionVerification {
  if (!raw || !secret) return { valid: false }

  const parts = raw.split(".")
  if (parts.length !== 2) return { valid: false }
  const [expiresAtRaw, signature] = parts

  const expectedSignature = signSessionValue(expiresAtRaw, secret)
  // 서명은 항상 hex 인코딩이므로(signSessionValue가 digest("hex")를 반환) 명시적으로
  // hex로 디코딩한다 — 인코딩을 생략하면 기본값(utf8)으로 해석되어, 우연히 지금은 결과가
  // 같더라도 다른 인코딩으로 바뀌면 조용히 깨질 수 있다.
  const signatureBuffer = Buffer.from(signature, "hex")
  const expectedBuffer = Buffer.from(expectedSignature, "hex")
  // 길이가 다르면 timingSafeEqual이 예외를 던지므로 먼저 길이를 비교해 가드한다.
  if (signatureBuffer.length !== expectedBuffer.length) return { valid: false }
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return { valid: false }

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return { valid: false }

  return { valid: true, expiresAt }
}

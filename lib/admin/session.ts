import "server-only"

import { timingSafeEqual, createHash } from "node:crypto"
import { cookies } from "next/headers"

import { adminEnv } from "@/lib/admin/env"
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin/session-cookie"
import { createSessionToken, verifySessionToken } from "@/lib/admin/session-token"
import type { AdminSessionVerification } from "@/types/admin"

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7일

// 길이가 다른 문자열끼리 timingSafeEqual을 호출하면 예외가 나거나(버퍼 길이 불일치)
// 길이 정보 자체가 타이밍으로 노출될 수 있으므로, 먼저 고정 길이 해시로 정규화한 뒤 비교한다.
// 단순 `===` 비교 금지.
export function verifyPassword(input: string): boolean {
  const inputHash = createHash("sha256").update(input).digest()
  const expectedHash = createHash("sha256").update(adminEnv.ADMIN_PASSWORD).digest()
  return timingSafeEqual(inputHash, expectedHash)
}

// {expiresAt}.{signature} 형식 — JWT 라이브러리를 새로 설치하지 않는다(의존성 추가 대비 이득 없음)
export function createSessionCookieValue(): string {
  return createSessionToken(adminEnv.ADMIN_SESSION_SECRET, SESSION_MAX_AGE_SECONDS)
}

// 인가 판정의 심층 방어(defense-in-depth) 계층 — proxy.ts가 이제 서명까지 검증해 진짜
// 307을 돌려주지만(Task 022 후속 결정, lib/admin/session-token.ts 상단 배경 참고), proxy
// matcher 설정 실수나 향후 리팩터링으로 커버리지가 조용히 빠질 수 있다는 Next 공식 권고에
// 따라 이 세그먼트 진입 시 항상 다시 검증한다.
export async function verifySession(): Promise<AdminSessionVerification> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value
  return verifySessionToken(raw, adminEnv.ADMIN_SESSION_SECRET)
}

// 쿠키 옵션은 여기 한 곳에서만 정의해 loginAction/logoutAction이 재사용한다.
export const ADMIN_SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
}
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_SECONDS

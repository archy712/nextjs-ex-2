import "server-only"

import { z } from "zod"

// 관리자 인증 전용 환경변수. Notion 연동과는 관심사가 분리되어 있어 lib/notion/env.ts와
// 섞지 않고 별도 파일로 둔다(Task 017 결정).
//
// SITE_URL(Task 021): 클라이언트 조회 링크(`{SITE_URL}/invoice/{id}`)를 조립할 때 쓰는
// 기준 도메인. 후보 A/B/C 중 B안(이 서버 전용 환경변수를 서버 컴포넌트에서 읽어 완성된
// 절대 URL을 props로 내려주는 방식)을 채택했다.
//   - A안(window.location.origin): 로컬/Preview에서 복사하면 클라이언트가 열 수 없는
//     링크가 생기는 사고 위험이 있어 기각.
//   - C안(Notion invoice_url 포뮬러 조회): 포뮬러 문자열 구현에 의존하게 되어 취약해서 기각.
//   - B안: 로컬 개발 중에도 SITE_URL을 프로덕션 도메인으로 고정해두면 항상 프로덕션
//     링크가 보장되므로 채택. Notion 연동과 무관하고 관리자 기능에서만 쓰이는 값이라
//     lib/notion/env.ts가 아니라 이 파일에 둔다(무인증 공개 /invoice/[id] 경로가
//     lib/notion/env.ts에 의존하므로 절대 섞지 않는다 — Task 017 사고 재발 방지).
const adminEnvSchema = z.object({
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_SESSION_SECRET: z.string().min(32),
  SITE_URL: z.string().url(),
})

const parsed = adminEnvSchema.safeParse({
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
  SITE_URL: process.env.SITE_URL,
})

if (!parsed.success) {
  throw new Error(
    "관리자 인증 환경 변수가 올바르게 설정되지 않았습니다: ADMIN_PASSWORD(8자 이상), ADMIN_SESSION_SECRET(32자 이상), SITE_URL(유효한 URL)을 .env.local에 설정하세요."
  )
}

export const adminEnv = parsed.data

import "server-only"

import { z } from "zod"

// 관리자 인증 전용 환경변수. Notion 연동과는 관심사가 분리되어 있어 lib/notion/env.ts와
// 섞지 않고 별도 파일로 둔다(Task 017 결정).
const adminEnvSchema = z.object({
  ADMIN_PASSWORD: z.string().min(8),
  ADMIN_SESSION_SECRET: z.string().min(32),
})

const parsed = adminEnvSchema.safeParse({
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
})

if (!parsed.success) {
  throw new Error(
    "관리자 인증 환경 변수가 올바르게 설정되지 않았습니다: ADMIN_PASSWORD(8자 이상), ADMIN_SESSION_SECRET(32자 이상)을 .env.local에 설정하세요."
  )
}

export const adminEnv = parsed.data

import "server-only"

import { z } from "zod"

// 관리자 견적서 목록 조회(Task 023) 전용 환경변수. 무인증 공개 견적서 조회 경로가
// 의존하는 lib/notion/env.ts와 분리해, 이 값이 없어도 그 경로가 영향받지 않게 한다.
const invoicesEnvSchema = z.object({
  // 데이터소스 ID이며 데이터베이스 ID가 아니다 — v1 Task 003에서 이 둘을 혼동해 실패한 전례가 있다.
  NOTION_INVOICES_DATA_SOURCE_ID: z.string().min(1),
})

const parsed = invoicesEnvSchema.safeParse({
  NOTION_INVOICES_DATA_SOURCE_ID: process.env.NOTION_INVOICES_DATA_SOURCE_ID,
})

if (!parsed.success) {
  throw new Error(
    "관리자 견적서 목록 환경 변수가 올바르게 설정되지 않았습니다: NOTION_INVOICES_DATA_SOURCE_ID를 .env.local에 설정하세요."
  )
}

export const notionInvoicesEnv = parsed.data

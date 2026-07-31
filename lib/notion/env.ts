import "server-only"

import { z } from "zod"

const envSchema = z.object({
  NOTION_API_KEY: z.string().min(1),
  NOTION_ITEMS_DATA_SOURCE_ID: z.string().min(1),
})

const parsed = envSchema.safeParse({
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_ITEMS_DATA_SOURCE_ID: process.env.NOTION_ITEMS_DATA_SOURCE_ID,
})

if (!parsed.success) {
  throw new Error(
    "Notion 환경 변수가 올바르게 설정되지 않았습니다: NOTION_API_KEY, NOTION_ITEMS_DATA_SOURCE_ID를 .env.local에 설정하세요."
  )
}

export const notionEnv = parsed.data

import "server-only"

import { Client } from "@notionhq/client"

import { notionEnv } from "@/lib/notion/env"

export const notion = new Client({
  auth: notionEnv.NOTION_API_KEY,
  notionVersion: "2025-09-03",
  // SDK 내장 타임아웃/재시도(429·5xx 시 Retry-After 기반) — 수동 AbortSignal 구현 대신 사용
  timeoutMs: 5000,
  retry: { maxRetries: 1 },
})

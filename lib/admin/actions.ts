"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import {
  ADMIN_SESSION_COOKIE_OPTIONS,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createSessionCookieValue,
  verifyPassword,
} from "@/lib/admin/session"
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin/session-cookie"
import { ADMIN_LOGIN_ERROR_MESSAGE } from "@/lib/admin/messages"
import type { AdminLoginState } from "@/types/admin"

const loginSchema = z.object({
  // 상한 없이 임의 길이 문자열을 매 요청마다 해싱하지 않도록 넉넉한 상한만 둔다
  // (실제 비밀번호가 이보다 길 일은 없음 — rate limiter 미도입은 ROADMAP.md의
  // "1인 사업자 내부 도구" 규모 판단에 따른 별개의 의도적 결정).
  password: z.string().min(1).max(200),
})

export async function loginAction(
  prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  // 검증 실패든 verifyPassword() 실패든 동일한 일반 오류 메시지를 반환한다 — 어느 쪽이
  // 실패했는지 알려주면 "빈 값이 아니라 값 자체가 틀렸다"는 정보가 새어나갈 수 있다.
  const parsed = loginSchema.safeParse({ password: formData.get("password") })

  if (!parsed.success) {
    console.warn("admin_login_failed", { at: new Date().toISOString() })
    return { status: "error", message: ADMIN_LOGIN_ERROR_MESSAGE }
  }

  if (!verifyPassword(parsed.data.password)) {
    console.warn("admin_login_failed", { at: new Date().toISOString() })
    return { status: "error", message: ADMIN_LOGIN_ERROR_MESSAGE }
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, createSessionCookieValue(), {
    ...ADMIN_SESSION_COOKIE_OPTIONS,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })

  // redirect()는 NEXT_REDIRECT 예외를 던져서 동작하므로 try/catch로 감싸 삼키지 않는다.
  // returnTo(로그인 후 원래 가려던 경로로 복귀)는 의도적으로 구현하지 않는다 — 보호
  // 경로가 /admin 하나뿐이라 항상 같은 목적지로 보내면 충분하고, returnTo를 받으면
  // open-redirect 방지용 화이트리스트 검증까지 추가해야 해서 이 규모에는 과설계다.
  redirect("/admin")
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  // 쿠키를 설정할 때 path: "/"를 명시했으므로 삭제 시에도 동일한 path를 지정해야
  // 브라우저가 같은 쿠키로 매칭해 실제로 지운다(path가 다르면 별개 쿠키로 취급될 수 있음).
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE_NAME, path: ADMIN_SESSION_COOKIE_OPTIONS.path })
  redirect("/admin/login")
}

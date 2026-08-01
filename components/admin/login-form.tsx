"use client"

import { useActionState, useId } from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAction } from "@/lib/admin/actions"
import { ADMIN_LOGIN_ERROR_MESSAGE } from "@/lib/admin/messages"
import type { AdminLoginState } from "@/types/admin"

const initialState: AdminLoginState = { status: "idle" }

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState)
  const errorId = useId()
  const hasError = state.status === "error"

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
        />
        {hasError && (
          // 어떤 값이 틀렸는지 유추할 수 있는 정보를 노출하지 않기 위해, state.message가
          // 무엇이든 이 화면에는 확정된 문구 하나만 보여준다(로드맵 Task 019 결정).
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {ADMIN_LOGIN_ERROR_MESSAGE}
          </p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />}
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  )
}

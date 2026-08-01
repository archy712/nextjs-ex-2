import { Button } from "@/components/ui/button"
import { logoutAction } from "@/lib/admin/actions"

interface AdminShellProps {
  children: React.ReactNode
}

// 관리자 공통 셸 — 상단 헤더 + 본문. 클라이언트 조회 페이지와 달리 여기에는 헤더가 있다.
// 로그아웃 버튼은 logoutAction을 호출하는 <form>으로 감싼다 — 이 컴포넌트가 서버
// 컴포넌트인 채로 유지되도록(onClick 핸들러를 위해 "use client"로 바꿀 필요 없음) 폼
// action에 서버 액션을 직접 연결하는 방식을 택했다(Task 022).
// 헤더 제목은 현재 로드맵상 관리자 화면이 견적서 목록 하나뿐이라 고정 문자열로 둔다 —
// 화면이 추가되면 title prop을 받도록 확장할 것.
export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">견적서 관리 시스템</span>
          <h1 className="text-base font-semibold">견적서 목록</h1>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            로그아웃
          </Button>
        </form>
      </header>
      <main className="flex flex-1 flex-col p-4 sm:p-6">{children}</main>
    </div>
  )
}

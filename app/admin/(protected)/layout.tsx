// [Task 022 최종 결정] verifySession() 호출은 이 layout이 아니라 app/admin/(protected)/page.tsx
// 최상단에 있다 — (A)안 채택. 이유: loading.tsx는 같은 세그먼트의 layout.tsx 자체를 감싸지
// 않고 page.tsx(및 그 하위)만 감싸므로, cacheComponents 환경에서 cookies()를 이 layout
// 함수 본문에서 직접 읽으면 loading.tsx가 그 동적 읽기를 커버하지 못해 빌드 타임 프리렌더
// 오류가 날 위험이 있었다. page.tsx로 옮기면 기존 loading.tsx가 그대로 Suspense 경계
// 역할을 하고, 별도 <Suspense> 분리 컴포넌트((B)안)를 새로 만들 필요가 없어 더 단순하다
// (이 프로젝트의 "과설계 금지" 원칙). `npm run build`로 cacheComponents 프리렌더 에러 없이
// 통과함을 확인했다.
//
// 이 layout 자체는 세션을 검증하지 않지만, page.tsx의 verifySession()이 이 세그먼트
// 진입 시 항상 다시 실행되므로 심층 방어(defense-in-depth) 역할을 한다. 1차 방어는
// proxy.ts로 옮겨졌다 — 처음엔 쿠키 "존재 여부"만 봤지만, 이 세그먼트가 cacheComponents
// (PPR) 대상이라 AdminShell(이 layout)이 정적 셸로 먼저 200 스트리밍을 시작한 뒤에야
// page.tsx의 redirect()가 실행되어, 위조/만료 쿠키에 대해 진짜 307이 아니라 클라이언트
// 전용 소프트 리다이렉트만 나가는 문제가 있었다(code-reviewer가 실제 curl로 재현).
// 지금은 proxy.ts가 서명·만료까지 검증해 이 경우도 렌더링이 시작되기 전에 진짜 307로
// 걸러낸다(lib/admin/session-token.ts 상단 배경 참고). page.tsx의 verifySession()은
// proxy 우회(matcher 설정 실수, 향후 리팩터링 등) 상황에 대비한 안전망으로 유지한다.
import { AdminShell } from "@/components/admin/admin-shell"

export default function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AdminShell>{children}</AdminShell>
}

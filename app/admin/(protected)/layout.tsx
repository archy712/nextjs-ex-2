// Task 022에서 이 자리에 verifySession() 호출을 추가해 세션이 없으면 /admin/login으로
// redirect한다. proxy.ts는 쿠키 존재 여부만 보는 낙관적 1차 관문이므로, 서명·만료 검증의
// 유일한 진실 공급원은 이 레이아웃(또는 하위 page)이 되어야 한다(Next 공식 권고 — proxy를
// 인가 판정에 전적으로 의존하지 않음).
//
// 주의: loading.tsx는 같은 세그먼트의 layout.tsx 자체를 감싸지 않고 page.tsx(및 그 하위)만
// 감싼다. cacheComponents 환경에서 cookies()를 이 layout 함수 본문에서 직접 읽으면 이
// loading.tsx가 그 동적 읽기를 커버하지 못해 빌드 타임 오류가 날 수 있다. Task 022 구현 시
// verifySession() 호출을 page.tsx로 옮기거나, layout 내부에 별도 <Suspense> 경계를 두는
// 방식을 택할 것.
export default function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}

// 로그인 실패 문구의 유일한 진실 공급원 — lib/admin/actions.ts("use server")와
// components/admin/login-form.tsx("use client")가 각각 다른 런타임 제약(서버 액션 파일은
// 함수만 export 가능, 클라이언트 컴포넌트는 server-only 모듈을 import 불가) 때문에 상수를
// 직접 공유할 수 없어 별도 파일로 분리했다. 문구를 바꿀 때는 이 한 곳만 수정하면 된다.
export const ADMIN_LOGIN_ERROR_MESSAGE = "비밀번호가 올바르지 않습니다"

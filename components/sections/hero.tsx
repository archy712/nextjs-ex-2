import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="size-3" />
          Next.js + shadcn/ui 스타터킷
        </Badge>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          다음 프로젝트를 몇 주가 아닌 며칠 만에 출시하세요
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-balance">
          풍부한 컴포넌트 라이브러리, 다크 모드, 반응형 레이아웃, 대시보드
          페이지까지 갖춘 프로덕션 준비 완료 스타터킷입니다. Next.js,
          TypeScript, Tailwind CSS로 제작되었습니다.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/gallery">
              시작하기
              <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/gallery/components">컴포넌트 보기</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

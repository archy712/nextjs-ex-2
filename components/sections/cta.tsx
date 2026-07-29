import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">
          컴포넌트를 살펴볼 준비가 되셨나요?
        </h2>
        <p className="max-w-lg text-primary-foreground/80">
          컴포넌트 쇼케이스, 폼 예제, 대시보드, 테이블/리스트 패턴까지 —
          프로젝트에 바로 사용할 수 있는 전체 갤러리를 둘러보세요.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/gallery">
            갤러리 둘러보기
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  )
}

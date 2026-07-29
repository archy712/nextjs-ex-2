import Link from "next/link"
import type { Metadata } from "next"
import { Component, FileText, AreaChart, Table as TableIcon, ArrowRight } from "lucide-react"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "갤러리",
}

const sections = [
  {
    href: "/gallery/components",
    icon: Component,
    title: "컴포넌트 쇼케이스",
    description: "설치된 모든 입력, 피드백, 오버레이, 내비게이션 컴포넌트를 한곳에서 확인하세요.",
  },
  {
    href: "/gallery/form",
    icon: FileText,
    title: "폼 예제",
    description: "React Hook Form과 Zod로 만든 검증 로직이 포함된 프로필 폼입니다.",
  },
  {
    href: "/gallery/dashboard",
    icon: AreaChart,
    title: "대시보드 예제",
    description: "공통 디자인 토큰으로 스타일링된 통계 카드와 차트를 확인하세요.",
  },
  {
    href: "/gallery/table",
    icon: TableIcon,
    title: "테이블 / 리스트 예제",
    description: "아바타, 상태 배지, 목업 데이터를 포함한 데이터 테이블입니다.",
  },
]

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">갤러리</h1>
        <p className="mt-1 text-muted-foreground">
          이 스타터킷에는 shadcn/ui 컴포넌트 라이브러리와 실전 예제 페이지가
          모두 포함되어 있습니다. 아래에서 원하는 섹션을 살펴보세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.href}>
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <section.icon className="size-4" />
              </div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href={section.href}>
                  보기
                  <ArrowRight />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

import {
  Moon,
  ShieldCheck,
  FileCheck2,
  Smartphone,
  LayoutTemplate,
  BarChart3,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Moon,
    title: "다크 모드 지원",
    description:
      "next-themes로 라이트, 다크, 시스템 테마가 기본 설정되어 있습니다.",
  },
  {
    icon: ShieldCheck,
    title: "접근성 높은 컴포넌트",
    description:
      "Radix UI 프리미티브를 기반으로 키보드 조작과 스크린 리더를 지원합니다.",
  },
  {
    icon: FileCheck2,
    title: "타입 안전한 폼",
    description:
      "React Hook Form과 Zod 검증을 shadcn/ui 폼 필드 스타일로 제공합니다.",
  },
  {
    icon: Smartphone,
    title: "기본 반응형 지원",
    description:
      "모바일 우선으로 설계된 반응형 헤더, 사이드바, 내비게이션을 제공합니다.",
  },
  {
    icon: LayoutTemplate,
    title: "조합 가능한 레이아웃",
    description:
      "마케팅 레이아웃과 대시보드 레이아웃을 자유롭게 조합하고 확장할 수 있습니다.",
  },
  {
    icon: BarChart3,
    title: "데이터 시각화",
    description:
      "Recharts 기반 차트 컴포넌트가 디자인 토큰에 맞춰 테마 처리됩니다.",
  },
]

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight">
          시작에 필요한 모든 것
        </h2>
        <p className="mt-3 text-muted-foreground">
          보일러플레이트가 아닌 제품 개발에 집중할 수 있도록 필요한 기능을
          모두 갖췄습니다.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {feature.description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

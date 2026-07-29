import type { Metadata } from "next"
import { DollarSign, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DashboardChart } from "@/components/gallery/dashboard-chart"

export const metadata: Metadata = {
  title: "대시보드",
}

const stats = [
  {
    label: "총 매출",
    value: "$37,900",
    delta: "+12.4%",
    trend: "up" as const,
    icon: DollarSign,
  },
  {
    label: "활성 사용자",
    value: "2,568",
    delta: "+8.1%",
    trend: "up" as const,
    icon: Users,
  },
  {
    label: "전환율",
    value: "3.2%",
    delta: "-0.4%",
    trend: "down" as const,
    icon: TrendingUp,
  },
  {
    label: "평균 세션 시간",
    value: "4분 12초",
    delta: "+2.1%",
    trend: "up" as const,
    icon: Activity,
  },
]

const recentActivity = [
  { name: "Ava Kim", action: "프로 플랜으로 업그레이드했습니다", time: "2분 전" },
  { name: "Liam Chen", action: "팀원을 초대했습니다", time: "18분 전" },
  { name: "Noah Park", action: "새 프로젝트를 생성했습니다", time: "1시간 전" },
  { name: "Mia Lopez", action: "구독을 취소했습니다", time: "3시간 전" },
]

export default function DashboardGalleryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
        <p className="mt-1 text-muted-foreground">
          목업 데이터로 구성한 통계 개요와 차트 예제입니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription className="flex items-center justify-between">
                {stat.label}
                <stat.icon className="size-4" />
              </CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stat.trend === "up" ? "secondary" : "destructive"} className="gap-1">
                {stat.trend === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                {stat.delta}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>매출 & 사용자</CardTitle>
            <CardDescription>최근 7개월</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>팀의 최신 활동 내역</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {recentActivity.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>
                    {item.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-sm">
                  <span className="font-medium">{item.name}</span>{" "}
                  <span className="text-muted-foreground">{item.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

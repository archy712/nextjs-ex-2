"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const data = [
  { month: "Jan", revenue: 4200, users: 240 },
  { month: "Feb", revenue: 3800, users: 280 },
  { month: "Mar", revenue: 5100, users: 320 },
  { month: "Apr", revenue: 4700, users: 360 },
  { month: "May", revenue: 6200, users: 410 },
  { month: "Jun", revenue: 7100, users: 460 },
  { month: "Jul", revenue: 6800, users: 500 },
]

const chartConfig = {
  revenue: {
    label: "매출",
    color: "var(--chart-1)",
  },
  users: {
    label: "활성 사용자",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function DashboardChart() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Area
          dataKey="users"
          type="monotone"
          fill="url(#fillUsers)"
          stroke="var(--color-users)"
          stackId="a"
        />
        <Area
          dataKey="revenue"
          type="monotone"
          fill="url(#fillRevenue)"
          stroke="var(--color-revenue)"
          stackId="b"
        />
      </AreaChart>
    </ChartContainer>
  )
}

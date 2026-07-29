"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Bell, CalendarIcon, Info, TriangleAlert } from "lucide-react"
import { format } from "date-fns"
import { useLocalStorage } from "usehooks-ts"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { useIsMobile, useIsTablet, useIsDesktop } from "@/hooks/use-breakpoint"

const buttonVariants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const buttonSizes = ["default", "sm", "lg", "icon"] as const
const badgeVariants = ["default", "secondary", "outline", "destructive", "ghost", "link"] as const

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default function ComponentsGalleryPage() {
  const [progress, setProgress] = useState(66)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isDesktop = useIsDesktop()
  const [rememberPref, setRememberPref] = useLocalStorage("demo-preference", false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col gap-12 pb-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">컴포넌트</h1>
        <p className="mt-1 text-muted-foreground">
          이 스타터킷에 설치된 모든 컴포넌트를 카테고리별로 확인하세요.
        </p>
      </div>

      <Section title="버튼">
        <div className="flex flex-wrap items-center gap-3">
          {buttonVariants.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {buttonSizes.map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="배지">
        <div className="flex flex-wrap items-center gap-3">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Section>

      <Section
        title="입력 요소"
        description="입력 컴포넌트를 개별적으로 보여줍니다 — 검증까지 포함된 전체 폼은 폼 예제 페이지를 확인하세요."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="demo-input">이메일</Label>
            <Input id="demo-input" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="demo-select">역할</Label>
            <Select defaultValue="member">
              <SelectTrigger id="demo-select" className="w-full">
                <SelectValue placeholder="역할을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="member">멤버</SelectItem>
                <SelectItem value="viewer">뷰어</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="demo-textarea">자기소개</Label>
            <Textarea id="demo-textarea" placeholder="자신에 대해 소개해주세요" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="demo-checkbox" defaultChecked />
            <Label htmlFor="demo-checkbox">이용약관에 동의합니다</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="demo-switch" defaultChecked />
            <Label htmlFor="demo-switch">알림 활성화</Label>
          </div>
          <div className="flex flex-col gap-2">
            <Label>플랜</Label>
            <RadioGroup defaultValue="pro">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="basic" id="plan-basic" />
                <Label htmlFor="plan-basic">베이직</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="pro" id="plan-pro" />
                <Label htmlFor="plan-pro">프로</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Label>볼륨</Label>
            <Slider defaultValue={[40]} max={100} step={1} />
          </div>
        </div>
      </Section>

      <Section
        title="캘린더"
        description="react-day-picker 기반의 날짜 선택 컴포넌트입니다."
      >
        <div className="flex flex-wrap items-start gap-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border"
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date-picker">날짜 선택 (Popover)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-picker"
                  variant="outline"
                  className="w-56 justify-start text-left font-normal"
                >
                  <CalendarIcon />
                  {date ? format(date, "yyyy년 M월 d일") : <span>날짜를 선택하세요</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Section>

      <Section title="피드백">
        <div className="flex flex-col gap-4">
          <Alert>
            <Info />
            <AlertTitle>알려드립니다</AlertTitle>
            <AlertDescription>참고용 정보 알림입니다.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>문제가 발생했습니다</AlertTitle>
            <AlertDescription>위험 상태를 나타내는 알림입니다.</AlertDescription>
          </Alert>

          <div className="flex flex-col gap-2">
            <Progress value={progress} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProgress((p) => Math.max(0, p - 10))}
              >
                -10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProgress((p) => Math.min(100, p + 10))}
              >
                +10
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => toast.success("저장되었습니다")}>
              성공 토스트 표시
            </Button>
            <Button variant="outline" onClick={() => toast.error("문제가 발생했습니다")}>
              오류 토스트 표시
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="알림">
                  <Bell />
                </Button>
              </TooltipTrigger>
              <TooltipContent>알림</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Section>

      <Section title="오버레이">
        <div className="flex flex-wrap items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">다이얼로그 열기</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>프로필 수정</DialogTitle>
                <DialogDescription>여기에서 프로필 정보를 수정하세요.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">취소</Button>
                </DialogClose>
                <Button>저장</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">계정 삭제</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>정말 확실한가요?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없으며 계정이 영구적으로 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction>계속</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">시트 열기</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>설정</SheetTitle>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">팝오버 열기</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-sm">팝오버 내용이 여기에 표시됩니다.</p>
            </PopoverContent>
          </Popover>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline">호버 카드</Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <p className="text-sm">마우스를 올리면 표시되며 사용자 미리보기 등에 유용합니다.</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </Section>

      <Section title="내비게이션">
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="account" className="w-full">
            <TabsList>
              <TabsTrigger value="account">계정</TabsTrigger>
              <TabsTrigger value="password">비밀번호</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="text-sm text-muted-foreground">
              여기에서 계정 설정을 관리하세요.
            </TabsContent>
            <TabsContent value="password" className="text-sm text-muted-foreground">
              여기에서 비밀번호를 변경하세요.
            </TabsContent>
          </Tabs>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">홈</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/gallery">갤러리</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>컴포넌트</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-fit">
                메뉴 열기
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>프로필</DropdownMenuItem>
              <DropdownMenuItem>결제</DropdownMenuItem>
              <DropdownMenuItem variant="destructive">로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>

      <Section title="아바타 & 카드">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="사용자 아바타" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>카드 제목</CardTitle>
            <CardDescription>카드 설명이 여기에 표시됩니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            카드는 이 스타터킷 전반에서 콘텐츠를 그룹화하는 데 사용됩니다.
          </CardContent>
        </Card>
      </Section>

      <Section
        title="훅"
        description="hooks/use-breakpoint.ts의 usehooks-ts 래퍼와 useLocalStorage를 실시간으로 확인해보세요."
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm">
            현재 화면 크기:{" "}
            <Badge variant="secondary">
              {isMobile ? "모바일" : isTablet ? "태블릿" : isDesktop ? "데스크톱" : "감지 중..."}
            </Badge>
          </p>
          <div className="flex items-center gap-2">
            <Switch
              id="remember-pref"
              checked={rememberPref}
              onCheckedChange={setRememberPref}
            />
            <Label htmlFor="remember-pref">
              내 설정 기억하기 (useLocalStorage로 저장됩니다 — 새로고침해도 유지되는지 확인해보세요)
            </Label>
          </div>
        </div>
      </Section>
    </div>
  )
}

import type { Metadata } from "next"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const metadata: Metadata = {
  title: "테이블",
}

type Status = "active" | "invited" | "suspended"

const statusVariant: Record<Status, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  invited: "outline",
  suspended: "destructive",
}

const statusLabel: Record<Status, string> = {
  active: "활성",
  invited: "초대됨",
  suspended: "정지됨",
}

const roleLabel: Record<string, string> = {
  Admin: "관리자",
  Member: "멤버",
  Viewer: "뷰어",
}

const users: {
  name: string
  email: string
  role: string
  status: Status
  joined: string
}[] = [
  { name: "Ava Kim", email: "ava@example.com", role: "Admin", status: "active", joined: "2024-01-12" },
  { name: "Liam Chen", email: "liam@example.com", role: "Member", status: "active", joined: "2024-02-03" },
  { name: "Noah Park", email: "noah@example.com", role: "Member", status: "invited", joined: "2024-02-20" },
  { name: "Mia Lopez", email: "mia@example.com", role: "Viewer", status: "suspended", joined: "2024-03-01" },
  { name: "Ethan Wright", email: "ethan@example.com", role: "Member", status: "active", joined: "2024-03-14" },
  { name: "Sophia Turner", email: "sophia@example.com", role: "Admin", status: "active", joined: "2024-03-22" },
  { name: "Lucas Nguyen", email: "lucas@example.com", role: "Member", status: "invited", joined: "2024-04-05" },
  { name: "Olivia Bennett", email: "olivia@example.com", role: "Viewer", status: "active", joined: "2024-04-18" },
]

export default function TableGalleryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">테이블 / 리스트 예제</h1>
        <p className="mt-1 text-muted-foreground">
          아바타, 상태 배지, 목업 데이터를 포함한 데이터 테이블입니다.
        </p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>가입일</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{roleLabel[user.role] ?? user.role}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[user.status]}>
                    {statusLabel[user.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.joined}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Box } from "lucide-react"

import { Separator } from "@/components/ui/separator"

const footerLinks = [
  {
    heading: "제품",
    links: [
      { href: "/", label: "홈" },
      { href: "/gallery", label: "갤러리" },
      { href: "/gallery/components", label: "컴포넌트" },
    ],
  },
  {
    heading: "예제",
    links: [
      { href: "/gallery/form", label: "폼" },
      { href: "/gallery/dashboard", label: "대시보드" },
      { href: "/gallery/table", label: "테이블" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Box className="size-5" />
              <span>스타터킷</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              풍부한 컴포넌트 라이브러리, 다크 모드, 대시보드 레이아웃을 갖춘
              Next.js 스타터킷입니다.
            </p>
          </div>

          <div className="flex gap-12">
            {footerLinks.map((group) => (
              <div key={group.heading} className="flex flex-col gap-2">
                <span className="text-sm font-medium">{group.heading}</span>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} 스타터킷. 모든 권리 보유.
        </p>
      </div>
    </footer>
  )
}

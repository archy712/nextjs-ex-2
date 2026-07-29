import { Download, FileText, Smartphone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "노션 연동 조회",
    description:
      "노션에 등록된 견적서와 항목을 그대로 불러와 웹에서 바로 확인할 수 있습니다.",
  },
  {
    icon: Download,
    title: "PDF 다운로드",
    description:
      "다운로드 시 최신 데이터를 다시 조회해 한글이 깨지지 않는 PDF로 저장합니다.",
  },
  {
    icon: Smartphone,
    title: "반응형 디자인",
    description:
      "모바일, 태블릿, 데스크톱 등 어떤 기기에서도 편하게 견적서를 확인할 수 있습니다.",
  },
];

export default function RootPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-10">
        <div className="space-y-4 text-center">
          <Badge variant="secondary">공개 견적서 조회 서비스</Badge>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            노션 기반 견적서 관리 시스템
          </h1>
          <p className="text-muted-foreground mx-auto max-w-xl text-sm sm:text-base">
            노션을 데이터베이스로 활용해 견적서를 관리하고, 클라이언트가
            전달받은 고유 링크로 견적서를 조회하고 PDF로 다운로드할 수 있는
            서비스입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="w-full">
              <CardHeader>
                <Icon className="text-muted-foreground mb-2 size-6" />
                <CardTitle className="text-sm">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <FileText className="text-muted-foreground mb-2 size-8" />
            <CardTitle>견적서 링크로 접속해 주세요</CardTitle>
            <CardDescription>
              이 서비스는 노션에 등록된 견적서를 조회하기 위한 개별 링크로만
              접근할 수 있습니다. 전달받은 견적서 링크(/invoice/견적서 ID)를
              통해 접속해 주세요.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}

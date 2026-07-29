import { FileText } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RootPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <FileText className="text-muted-foreground mb-2 size-8" />
          <CardTitle>견적서 조회 서비스</CardTitle>
          <CardDescription>
            이 서비스는 노션에 등록된 견적서를 조회하기 위한 개별 링크로만
            접근할 수 있습니다. 전달받은 견적서 링크(/invoice/견적서 ID)를
            통해 접속해 주세요.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}

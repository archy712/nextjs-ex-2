"use client"

import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"

export function DownloadButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Download data-icon="inline-start" />
      PDF 다운로드
    </Button>
  )
}

"use client"

import { useMediaQuery } from "usehooks-ts"

export { useIsMobile } from "./use-mobile"

export function useIsTablet() {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)", {
    initializeWithValue: false,
  })
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)", {
    initializeWithValue: false,
  })
}

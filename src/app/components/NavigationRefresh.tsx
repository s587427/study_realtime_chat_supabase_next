"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function NavigationRefresh() {
  const router = useRouter()

  useEffect(() => {
    router.refresh()
  }, [router])

  return null // 隱藏組件，不渲染任何 UI
}

"use client"
import { ActionButton } from "@/components/ui/action-button"
import { useRouter } from "next/navigation"
import { ComponentProps } from "react"
import { createClient } from "../../services/supabase/client"
import useCurrentUser from "../../services/supabase/hooks/useCurrentUser"

export default function LeaveRoomButton({
  children,
  roomId,
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & { roomId: string }) {
  const router = useRouter()
  const { user } = useCurrentUser()

  async function leaveRoom() {
    if (user === null) {
      return { error: true, message: "User not logged in" }
    }
    const supabase = createClient()
    const { data, error } = await supabase
      .from("chat_room_member")
      .delete()
      .eq("chat_room_id", roomId)
      .eq("member_id", user.id)

    if (error) {
      return { error: true, message: "Failed to leave room" }
    }
    // router.refresh() 是在 Next.js 14+ 中，用來重新取得伺服器資料並更新 Server Component 的最佳方式，適合在 Client Component 中使用
    router.refresh()

    return { error: false }
  }
  return (
    <ActionButton {...props} action={leaveRoom}>
      {children}
    </ActionButton>
  )
}

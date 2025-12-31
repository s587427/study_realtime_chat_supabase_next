"use client"
import { ActionButton } from "@/components/ui/action-button"
import { useRouter } from "next/navigation"
import { ComponentProps } from "react"
import { createClient } from "../../services/supabase/client"
import useCurrentUser from "../../services/supabase/hooks/useCurrentUser"

export default function JoinRoomButton({
  children,
  roomId,
  ...props
}: Omit<ComponentProps<typeof ActionButton>, "action"> & { roomId: string }) {
  const router = useRouter()
  const { user } = useCurrentUser()

  async function joinRoom() {
    if (user === null) {
      return { error: true, message: "User not logged in" }
    }

    const supabase = createClient()
    const { data, error } = await supabase.from("chat_room_member").insert({
      chat_room_id: roomId,
      member_id: user.id,
    })

    if (error) {
      return { error: true, message: "Failed to join room" }
    }

    router.refresh()
    router.push(`/rooms/${roomId}`)

    return { error: false }
  }
  return (
    <ActionButton {...props} action={joinRoom}>
      {children}
    </ActionButton>
  )
}

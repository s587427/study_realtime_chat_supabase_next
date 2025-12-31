import { Message } from "@/app/services/supabase/actions/messages"
import { createClient } from "@/app/services/supabase/client"
import {
  REALTIME_SUBSCRIBE_STATES,
  RealtimeChannel,
} from "@supabase/supabase-js"
import { useEffect, useRef, useState } from "react"

export default function useRealTimeChat(roomId: string, userId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [onlineUsers, setOnlineUsers] = useState(1)
  const [realTimeMessages, setRealTimeMessages] = useState<Array<Message>>([])

  useEffect(() => {
    let isCancel = false
    const supabase = createClient()

    createChannel()

    async function createChannel() {
      await supabase.realtime.setAuth()
      if (isCancel) return
      const channel = supabase.channel(`room:${roomId}:messages`, {
        // . Remember to set the channel as a private channel, since realtime.broadcast_changes uses Realtime Authorization.
        // can check rls
        config: {
          private: true,
          presence: {
            key: userId,
          },
        },
      })
      // Listen for messages
      channel
        .on("presence", { event: "sync" }, () => {
          const newState = channel.presenceState()
          // console.log("sync", newState)
          // get total online user
          const userCount = Object.keys(newState).length
          setOnlineUsers(userCount === 0 ? 1 : userCount)
        })
        .on("broadcast", { event: "INSERT" }, (payload) => {
          // console.log(payload)
          const record = payload.payload
          setRealTimeMessages((preMessages) => [
            ...preMessages,
            {
              id: record.id,
              text: record.text,
              created_at: record.created_at,
              author_id: record.author_id,
              author: {
                name: record.author_name,
                image_url: record.author_image_url,
              },
            },
          ])
        })
        .subscribe(async (status: REALTIME_SUBSCRIBE_STATES) => {
          if (status !== "SUBSCRIBED") {
            return
          }
          const presenceTrackStatus = await channel.track({ userId })
          // console.log(presenceTrackStatus)
        })
      channelRef.current = channel
    }

    return () => {
      isCancel = true
      if (channelRef.current) {
        console.log("supabase.removeChannel")
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [roomId, userId])

  return { onlineUsers, realTimeMessages }
}

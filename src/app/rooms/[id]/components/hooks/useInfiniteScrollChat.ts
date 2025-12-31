import { Message } from "@/app/services/supabase/actions/messages"
import { createClient } from "@/app/services/supabase/client"
import { useState } from "react"

const LIMIT = 5
export default function useInfiniteScrollChat({
  startingMessages,
  roomId,
}: {
  startingMessages: Array<Message>
  roomId: string
}) {
  const [messages, setMessages] = useState(startingMessages)
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">(
    startingMessages.length === 0 ? "done" : "idle"
  )

  async function loadMoreMessages() {
    if (status === "done" || status === "loading") return
    const supabase = createClient()
    setStatus("loading")

    await new Promise((resolve) => setTimeout(resolve, 1000))
    // error test
    // setStatus("error")
    // return

    const { data, error } = await supabase
      .from("message")
      .select(
        "id, text, created_at, author_id, author:user_profile (name, image_url)" //  author:user_profile -> author is alias, left join user_profile get col name, image_url
      )
      .eq("chat_room_id", roomId)
      .lt("created_at", messages[0].created_at) //  "Less Than"
      .order("created_at", { ascending: false })
      .limit(LIMIT)

    if (error) {
      setStatus("error")
      return
    }

    setMessages((prev) => [...data.toReversed(), ...prev])

    if (data.length < LIMIT) {
      setStatus("done") // 沒有資料了
    } else {
      setStatus("idle")
    }
  }

  function triggerQueryRef(node: HTMLDivElement | null) {
    if (node == null) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target === node) {
            observer.unobserve(node)
            loadMoreMessages()
          }
        })
      },
      { rootMargin: "50px" }
    )

    observer.observe(node)

    // ! Cleanup functions for refs this is react 19+ features
    return () => {
      console.log("observer.disconnect")
      observer.disconnect()
    }
  }

  return { loadMoreMessages, messages, status, triggerQueryRef }
}

"use client"

import { Message } from "@/app/services/supabase/actions/messages"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import ChatInput from "./ChatInput"
import ChatMessage from "./ChatMessage"
import useInfiniteScrollChat from "./hooks/useInfiniteScrollChat"
import useRealTimeChat from "./hooks/useRealTimeChat"
import { InviteUserModal } from "./InviteUserModal"

export type MessageStatus = { status: "pending" | "error" | "success" }

export default function RoomClient({
  room,
  user,
  messages,
}: {
  user: { id: string; name: string; image_url: string | null }
  room: {
    id: string
    name: string
  }
  messages: Array<Message>
}) {
  const { onlineUsers, realTimeMessages } = useRealTimeChat(room.id, user.id)

  const {
    loadMoreMessages,
    messages: oldMessages,
    status,
    triggerQueryRef,
  } = useInfiniteScrollChat({
    startingMessages: messages.toReversed(),
    roomId: room.id,
  })

  const [sentMessages, setSentMessages] = useState<
    Array<Message & MessageStatus>
  >([])

  const visibleMessages = oldMessages.concat(
    realTimeMessages,
    sentMessages.filter((m) => !realTimeMessages.find((rm) => rm.id === m.id)) // 把已經在realTimeMessages排除
  )

  return (
    <div className="container mx-auto h-screen-with-header border border-y-0 flex flex-col">
      <div className="flex items-center justify-between gap-2 px-4">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-muted-foreground text-sm">
            {onlineUsers} {onlineUsers === 1 ? "user" : "users"} online
          </p>
        </div>
        <InviteUserModal roomId={room.id} />
      </div>

      <div
        className="grow overflow-y-auto flex flex-col-reverse"
        // className="grow overflow-y-auto flex flex-col"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        <div>
          {status === "loading" && (
            <p className="text-center text-sm text-muted-foreground py-2">
              Loading more messages...
            </p>
          )}

          {status === "error" && (
            <div className="text-center">
              <p className="text-sm text-destructive py-2">
                Error loading messages.
              </p>
              <Button onClick={loadMoreMessages} variant="outline">
                Retry
              </Button>
            </div>
          )}

          {visibleMessages.map((message, index) => (
            <ChatMessage
              key={message.id}
              {...message}
              ref={index === 0 && status === "idle" ? triggerQueryRef : null}
            />
          ))}
        </div>
      </div>

      <ChatInput
        roomId={room.id}
        onSend={(message) => {
          setSentMessages((prev) => [
            ...prev,
            {
              id: message.id,
              text: message.text,
              created_at: new Date().toISOString(),
              author_id: user.id,
              author: {
                name: user.name,
                image_url: user.image_url,
              },
              status: "pending",
            },
          ])
        }}
        onSuccessfulSend={(message) => {
          setSentMessages((prev) =>
            prev.map((m) =>
              m.id === message.id ? { ...message, status: "success" } : m
            )
          )
        }}
        onErrorSend={(id) => {
          setSentMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, status: "error" } : m))
          )
        }}
      />
    </div>
  )
}

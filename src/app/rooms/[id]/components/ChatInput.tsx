"use client"

import { Message, sendMessage } from "@/app/services/supabase/actions/messages"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { SendIcon } from "lucide-react"
import { FormEvent, useState } from "react"
import { toast } from "sonner"

type ChatInputProps = {
  roomId: string
  onSend: (message: { id: string; text: string }) => void
  onSuccessfulSend: (message: Message) => void
  onErrorSend: (id: string) => void
}

export default function ChatInput({
  roomId,
  onSend,
  onSuccessfulSend,
  onErrorSend,
}: ChatInputProps) {
  const [message, setMessage] = useState("")

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    const text = message.trim()
    if (!text) return

    setMessage("")

    // send message
    const id = crypto.randomUUID()
    onSend({ id, text })
    const result = await sendMessage({
      id,
      text,
      roomId,
    })
    if (result.error) {
      toast.error(result.message)
      onErrorSend(id)
    } else {
      onSuccessfulSend(result.message)
    }
    console.log("sendMessage on cmp")
  }
  return (
    <form className="p-3" onSubmit={handleSubmit}>
      <InputGroup>
        <InputGroupTextarea
          className="field-sizing-content min-h-auto"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <InputGroupAddon align="inline-end" onClick={handleSubmit}>
          <InputGroupButton>
            <SendIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

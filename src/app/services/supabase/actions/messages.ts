"use server"

import { getCurrentUser } from "@/app/data"
import { createAdminClient } from "../server"

export type Message = {
  id: string
  text: string
  created_at: string
  author_id: string
  author: {
    name: string
    image_url: string | null
  }
}

export async function sendMessage({
  id,
  text,
  roomId,
}: {
  id: string
  text: string
  roomId: string
}): Promise<
  { error: false; message: Message } | { error: true; message: string }
> {
  const user = await getCurrentUser()
  if (user == null) {
    return { error: true, message: "User not authenticated" }
  }

  if (!text.trim()) {
    return { error: true, message: "Message cannot be empty" }
  }

  // error test
  // return { error: true, message: "error test" }

  const supabase = await createAdminClient()
  const { data: message, error } = await supabase
    .from("message")
    .insert({
      id,
      text: text.trim(),
      chat_room_id: roomId,
      author_id: user.id,
    })
    .select(
      "id, text, created_at, author_id, author:user_profile (name, image_url)"
    )
    .single()
  // console.log(error)
  if (error) {
    return { error: true, message: "Failed to send message" }
  }

  // console.log("sendMessage -- on action")
  return { error: false, message }
}

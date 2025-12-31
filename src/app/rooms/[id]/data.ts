import { getCurrentUser } from "@/app/data"
import { createAdminClient } from "@/app/services/supabase/server"

export async function getRoom(id: string) {
  const user = await getCurrentUser()

  if (user == null) return null

  const supabase = await createAdminClient()
  const { data: room, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member!inner ()") // like sql inner join
    .eq("id", id)
    .eq("chat_room_member.member_id", user.id)
    .single()

  if (error) return null
  return room
}

export async function getUser() {
  const user = await getCurrentUser()
  if (user == null) return null
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from("user_profile")
    .select("id, name, image_url")
    .eq("id", user.id)
    .single()

  if (error) return null
  return data
}

export async function getMessages(roomId: string) {
  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from("message")
    .select(
      "id, text, created_at, author_id, author:user_profile (name, image_url)" //  author:user_profile -> author is alias, left join user_profile get col name, image_url
    )
    .eq("chat_room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) return []
  return data
}

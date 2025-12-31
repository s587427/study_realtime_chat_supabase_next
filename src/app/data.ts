import { cache } from "react"
import { createAdminClient, createClient } from "./services/supabase/server"

// cache Usage
// Cache an expensive computation
// Share a snapshot of data
// Preload data
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()

  const userResult = await supabase.auth.getUser()
  const user = userResult.data.user

  // console.log("exec getCurrentUser") test for execute for count
  return user
})

export async function getPublicRooms() {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member (count)")
    .eq("is_public", true)
    .order("name", { ascending: true })

  /*generate query like
    SELECT 
      chat_room.id,
      chat_room.name,
      (
        SELECT COUNT(*) 
        FROM chat_room_member 
        WHERE chat_room_member.chat_room_id = chat_room.id
      ) AS count
    FROM chat_room
    WHERE chat_room.is_public = true
    ORDER BY chat_room.name ASC;
  */

  if (error) {
    return []
  }

  return data.map((room) => ({
    id: room.id,
    name: room.name,
    memberCount: room.chat_room_member[0].count,
  }))
}

export async function getJoinedRooms(userId: string) {
  const supabase = await createAdminClient()

  // 查詢doc supabase 目前關聯表不支援 where 故需自己filter
  const { data, error } = await supabase
    .from("chat_room")
    .select("id, name, chat_room_member (member_id)")
    // .eq("is_public", true)
    .order("name", { ascending: true })

  /*generate query like
   SELECT 
      chat_room.id,
      chat_room.name,
      (
        SELECT json_agg(member_id)
        FROM chat_room_member
        WHERE chat_room_member.chat_room_id = chat_room.id
      ) AS chat_room_member
    FROM chat_room
    WHERE chat_room.is_public = true
    ORDER BY chat_room.name ASC;
  */

  if (error) {
    return []
  }

  return data
    .filter((room) =>
      room.chat_room_member.some((member) => member.member_id === userId)
    )
    .map((room) => ({
      id: room.id,
      name: room.name,
      memberCount: room.chat_room_member.length,
    }))
}

"use server"

import { getCurrentUser } from "@/app/data"
import { redirect } from "next/navigation"
import z from "zod"
import { createRoomSchema } from "../schemas/rooms"
import { createAdminClient } from "../server"

// server action is next14+ feature

export async function createRoom(unsafeData: z.infer<typeof createRoomSchema>) {
  // handle validation input data
  const { success, data } = createRoomSchema.safeParse(unsafeData)

  if (!success) {
    return { error: true, message: "Invaild room data" }
  }

  // handle validation auth
  // get current user
  const user = await getCurrentUser()

  if (user == null) {
    return { error: true, message: "User not authenticated" }
  }

  const supabaeAdmin = await createAdminClient()

  // create room
  const { data: room, error: roomError } = await supabaeAdmin
    .from("chat_room")
    .insert({ name: data.name, is_public: data.isPublic })
    .select("id")
    .single()

  if (roomError || room == null) {
    // console.log({ roomError })
    return { error: true, message: "Failed to create room" }
  }

  // enter room
  const { error: memberShipError } = await supabaeAdmin
    .from("chat_room_member")
    .insert({
      chat_room_id: room.id,
      member_id: user.id,
    })

  if (memberShipError) {
    console.log({ memberShipError })
    return { error: true, message: "Failed to add user to room" }
  }

  redirect(`/rooms/${room.id}`)
}

export async function addUserToRoom({
  roomId,
  userId,
}: {
  roomId: string
  userId: string
}) {
  const currentUser = await getCurrentUser()

  if (currentUser == null) {
    return { error: true, message: "user not authenticated" }
  }

  const supabase = await createAdminClient()
  const { data: roomMembership, error: roomMemberShipError } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", roomId)
    .eq("member_id", currentUser.id)

  if (roomMemberShipError || !roomMembership) {
    return { error: true, message: "Current user is not a member of the room" }
  }

  const { data: userProfile } = await supabase
    .from("user_profile")
    .select("id")
    .eq("id", userId)
    .single()

  if (userProfile == null) {
    return { error: true, message: "User not found" }
  }

  const { data: existingMemebershiop } = await supabase
    .from("chat_room_member")
    .select("member_id")
    .eq("chat_room_id", roomId)
    .eq("member_id", userProfile.id)
    .single()

  if (existingMemebershiop !== null) {
    return { error: true, message: "User is already a member of the room" }
  }

  const { error: insertError } = await supabase
    .from("chat_room_member")
    .insert({ chat_room_id: roomId, member_id: userProfile.id })

  if (insertError) {
    return { error: true, message: "Failed to add user to room" }
  }

  return { error: false, message: "User added to room successfully" }
}

import { notFound } from "next/navigation"
import RoomClient from "./components/ClientRoom"
import { getMessages, getRoom, getUser } from "./data"

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [room, user, messages] = await Promise.all([
    getRoom(id),
    getUser(),
    getMessages(id),
  ])

  if (room == null || user == null) return notFound()

  return <RoomClient room={room} user={user} messages={messages} />
}

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { MessageSquareIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import NavigationRefresh from "./components/NavigationRefresh"
import { getCurrentUser, getJoinedRooms, getPublicRooms } from "./data"
import RoomList from "./rooms/components/RoomList"
export default async function Home() {
  const user = await getCurrentUser()
  if (user == null) {
    redirect("/auth/login")
  }

  const [publicRooms, joinedRooms] = await Promise.all([
    getPublicRooms(),
    getJoinedRooms(user?.id),
  ])

  if (publicRooms.length === 0 && joinedRooms.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* 隱藏的客戶端監聽器，不影響 SSR */}
        {/* 瀏覽器按上頁不會重新從server拿資料暫時用此解 */}
        <Suspense fallback={null}>
          <NavigationRefresh />
        </Suspense>
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareIcon />
            </EmptyMedia>
            <EmptyTitle>No Chat Rooms</EmptyTitle>
            <EmptyDescription>
              Create a new chat room to get started
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="rooms/new">Create Room</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Suspense fallback={null}>
        <NavigationRefresh />
      </Suspense>
      <RoomList title="Your Rooms" rooms={joinedRooms} isJoined />
      <RoomList
        title="Public Rooms"
        rooms={publicRooms.filter(
          (room) => !joinedRooms.some((joinedRoom) => joinedRoom.id === room.id)
        )}
      />
    </div>
  )
}

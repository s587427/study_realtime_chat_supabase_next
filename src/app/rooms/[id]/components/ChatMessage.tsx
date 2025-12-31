import { Message } from "@/app/services/supabase/actions/messages"
import { cn } from "@/lib/utils"
import { User2Icon } from "lucide-react"
import Image from "next/image"
import { Ref } from "react"
import { MessageStatus } from "./ClientRoom"

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
})

export default function ChatMessage({
  text,
  author,
  created_at,
  status,
  ref,
}: Message & Partial<MessageStatus> & { ref: Ref<HTMLDivElement> }) {
  return (
    <div
      ref={ref}
      className={cn(
        `flex gap-4 px-4 py-2 hover:bg-accent/50`,
        status === "pending" && "opacity-70",
        status === "error" && "bg-destructive/10 text-destructive"
      )}
    >
      <div className="shrink-0">
        {author.image_url != null ? (
          <Image
            src={author.image_url}
            alt={author.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div
            className="size-10 rounded-full flex iten-center justify-center 
            border bg-muted text-muted-foreground overflow-hidden"
          >
            <User2Icon className="size-7.5 mt-2.5" />
          </div>
        )}
      </div>

      <div className="grow space-y-0.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xm font-semibold">{author.name}</span>
          <span className="text-sx text-muted-foreground">
            {DATE_FORMATTER.format(new Date(created_at))}
          </span>
        </div>
        <p className="text text-sm wrap-break-word whitespace-pre">{text}</p>
      </div>
    </div>
  )
}

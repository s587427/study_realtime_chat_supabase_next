import { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { createClient } from "../client"

export default function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth
      .getUser()
      .then((info) => {
        setUser(info.data.user)
      })
      .finally(() => setIsLoading(false))

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return { user, isLoading }
}

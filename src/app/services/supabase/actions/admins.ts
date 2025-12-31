"use server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEYS!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function deleteUser(userId: string) {
  // Access auth admin api
  const adminAuthClient = supabase.auth.admin
  const { data, error } = await adminAuthClient.deleteUser(userId)

  if (error != null) {
    return { error: error, message: "Failed to delete user." }
  }
  return { data: data, message: "User deleted successfully." }
}

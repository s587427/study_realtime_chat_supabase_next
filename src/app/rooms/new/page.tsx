"use client"
import { deleteUser } from "@/app/services/supabase/actions/admins"
import { createRoom } from "@/app/services/supabase/actions/rooms"
import { createRoomSchema } from "@/app/services/supabase/schemas/rooms"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingSwap } from "@/components/ui/loading-swap"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

type FormData = z.infer<typeof createRoomSchema>
export default function NewRoomPage() {
  const router = useRouter()
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      isPublic: false,
    },
    resolver: zodResolver(createRoomSchema),
  })

  async function handleFormSubmit(data: FormData) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const { error, message } = await createRoom(data)

    if (error) {
      toast.error(message)
    }
  }

  async function handleDeleteUser() {
    const { error, message } = await deleteUser(
      "c8fc120e-a6ce-42af-9569-1a1b20c1b61d"
    )
    if (error) {
      toast.error(message)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>New Room</CardTitle>
          <CardDescription>Create a new chat room</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Room Name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="isPublic"
                control={form.control}
                render={({
                  field: { value, onChange, ...field },
                  fieldState,
                }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    orientation="horizontal"
                  >
                    <Checkbox
                      {...field}
                      id={field.name}
                      checked={value}
                      onCheckedChange={onChange}
                      aria-invalid={fieldState.invalid}
                    />

                    <FieldContent>
                      <FieldLabel className="font-normal" htmlFor={field.name}>
                        Public Room
                      </FieldLabel>
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                  </Field>
                )}
              />

              <Field orientation="horizontal">
                <Button
                  type="submit"
                  className="grow"
                  disabled={form.formState.isSubmitting}
                >
                  <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Create Room
                  </LoadingSwap>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {/* <div>
        <h2>Test Area</h2>
        <Button onClick={handleDeleteUser}>delete user</Button>
      </div> */}
    </div>
  )
}

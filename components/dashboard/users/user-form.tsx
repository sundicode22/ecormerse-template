"use client"

import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createAdminSchema,
  updateUserSchema,
  type CreateAdminInput,
  type UpdateUserInput,
} from "@/lib/validations/user"
import { ROLES } from "@/lib/auth/roles"
import {
  useCreateAdmin,
  useUpdateUser,
  type AdminUser,
} from "@/hooks/api/useUsers"
import { usePageModal } from "@/components/shared/page-modal"
import {
  FormAlert,
  mutationErrorMessage,
} from "@/components/shared/form-alert"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface UserFormProps {
  user?: AdminUser | null
}

export function UserForm({ user }: UserFormProps) {
  const isEditing = !!user
  const { closeModal } = usePageModal()
  const createMutation = useCreateAdmin()
  const updateMutation = useUpdateUser()

  const createForm = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema) as Resolver<CreateAdminInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ROLES.ADMIN,
    },
  })

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema) as Resolver<UpdateUserInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: user?.name || "",
      role: (user?.role as "admin" | "user") || ROLES.USER,
      password: "",
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && user) {
    const serverError = updateMutation.error
      ? mutationErrorMessage(updateMutation.error)
      : null

    return (
      <Form {...editForm}>
        <form
          onSubmit={editForm.handleSubmit((data) => {
            updateMutation.mutate(
              {
                id: user.id,
                name: data.name,
                role: data.role,
                password: data.password || undefined,
              },
              { onSuccess: () => closeModal() }
            )
          })}
          className="space-y-4 pb-6"
          noValidate
        >
          <FormAlert errors={editForm.formState.errors} serverError={serverError} />

          <FormField
            control={editForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Email</FormLabel>
            <Input value={user.email || ""} disabled />
            <FormDescription>Email cannot be changed.</FormDescription>
          </FormItem>

          <FormField
            control={editForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  >
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.USER}>User</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Leave blank to keep current"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Update user"}
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  const serverError = createMutation.error
    ? mutationErrorMessage(createMutation.error)
    : null

  return (
    <Form {...createForm}>
      <form
        onSubmit={createForm.handleSubmit((data) => {
          createMutation.mutate(data, { onSuccess: () => closeModal() })
        })}
        className="space-y-4 pb-6"
        noValidate
      >
        <FormAlert errors={createForm.formState.errors} serverError={serverError} />

        <FormField
          control={createForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Store Admin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={createForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={createForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Must include at least one letter and one number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={createForm.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                >
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.USER}>User</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create admin"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

 "use client"

import { useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createLabelSchema, type CreateLabelInput } from "@/lib/validations/label"
import {
  useCreateLabel,
  useUpdateLabel,
  type Label,
} from "@/hooks/api/useLabels"
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface LabelFormProps {
  label?: Label | null
}

export function LabelForm({ label }: LabelFormProps) {
  const isEditing = !!label
  const { closeModal } = usePageModal()
  const createMutation = useCreateLabel()
  const updateMutation = useUpdateLabel()

  const form = useForm<CreateLabelInput>({
    resolver: zodResolver(createLabelSchema) as Resolver<CreateLabelInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: label?.name || "",
      color: label?.color || "#6b7280",
    },
  })

  useEffect(() => {
    if (label) {
      form.reset({ name: label.name, color: label.color || "#6b7280" })
    }
  }, [label, form])

  const currentColor = form.watch("color")

  const onSubmit = (data: CreateLabelInput) => {
    if (isEditing && label) {
      updateMutation.mutate(
        { id: label.id, ...data },
        { onSuccess: () => closeModal() }
      )
    } else {
      createMutation.mutate(data, { onSuccess: () => closeModal() })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const serverError =
    createMutation.error || updateMutation.error
      ? mutationErrorMessage(createMutation.error || updateMutation.error)
      : null

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pb-6"
        noValidate
      >
        <FormAlert errors={form.formState.errors} serverError={serverError} />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bestseller" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Input
                    type="color"
                    value={field.value}
                    onChange={field.onChange}
                    className="size-10 cursor-pointer p-1"
                  />
                </FormControl>
                <Input
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  placeholder="#6b7280"
                  className="flex-1"
                />
                <div
                  className="size-8 shrink-0 rounded-full border"
                  style={{ backgroundColor: currentColor }}
                />
              </div>
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
            {isPending ? "Saving…" : isEditing ? "Update Label" : "Create Label"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

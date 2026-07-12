"use client"

import { useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createCollectionSchema,
  type CreateCollectionInput,
} from "@/lib/validations/collection"
import { slugify } from "@/lib/slugify"
import {
  useCreateCollection,
  useUpdateCollection,
  type Collection,
} from "@/hooks/api/useCollections"
import { usePageModal } from "@/components/shared/page-modal"
import { FileUpload } from "@/components/shared/file-upload"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface CollectionFormProps {
  collection?: Collection | null
}

export function CollectionForm({ collection }: CollectionFormProps) {
  const isEditing = !!collection
  const { closeModal } = usePageModal()
  const createMutation = useCreateCollection()
  const updateMutation = useUpdateCollection()

  const form = useForm<CreateCollectionInput>({
    resolver: zodResolver(createCollectionSchema) as Resolver<CreateCollectionInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: collection?.name || "",
      slug: collection?.slug || "",
      description: collection?.description || "",
      image: collection?.image || undefined,
    },
  })

  useEffect(() => {
    if (collection) {
      form.reset({
        name: collection.name,
        slug: collection.slug,
        description: collection.description || "",
        image: collection.image || undefined,
      })
    }
  }, [collection, form])

  const nameValue = form.watch("name")
  useEffect(() => {
    form.setValue("slug", slugify(nameValue || ""), {
      shouldValidate: false,
      shouldDirty: false,
    })
  }, [nameValue, form])

  const onSubmit = (data: CreateCollectionInput) => {
    const payload = { ...data, slug: slugify(data.name) || data.slug || "" }
    if (isEditing && collection) {
      updateMutation.mutate(
        { id: collection.id, ...payload },
        { onSuccess: () => closeModal() }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => closeModal() })
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value || ""}
                  readOnly
                  tabIndex={-1}
                  className="bg-muted/40 text-muted-foreground"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Generated automatically from the name.
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value ? [field.value] : []}
                  onChange={(urls) => field.onChange(urls[0] || undefined)}
                  multiple={false}
                  maxFiles={1}
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
            {isPending
              ? "Saving…"
              : isEditing
                ? "Update Collection"
                : "Create Collection"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

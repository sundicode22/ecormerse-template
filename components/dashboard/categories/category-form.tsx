"use client"

import { useEffect } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/lib/validations/category"
import { slugify } from "@/lib/slugify"
import {
  useCreateCategory,
  useUpdateCategory,
  useCategories,
  type Category,
} from "@/hooks/api/useCategories"
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

interface CategoryFormProps {
  category?: Category | null
}

export function CategoryForm({ category }: CategoryFormProps) {
  const isEditing = !!category
  const { closeModal } = usePageModal()
  const { data: allCategoriesResponse } = useCategories()
  const allCategories = allCategoriesResponse?.data || []
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema) as Resolver<CreateCategoryInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      image: category?.image || undefined,
      parentId: category?.parentId || null,
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || undefined,
        parentId: category.parentId || null,
      })
    }
  }, [category, form])

  const nameValue = form.watch("name")
  useEffect(() => {
    form.setValue("slug", slugify(nameValue || ""), {
      shouldValidate: false,
      shouldDirty: false,
    })
  }, [nameValue, form])

  const onSubmit = (data: CreateCategoryInput) => {
    const payload = { ...data, slug: slugify(data.name) || data.slug || "" }
    if (isEditing && category) {
      updateMutation.mutate(
        { id: category.id, ...payload },
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
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? Number(e.target.value) : null)
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                >
                  <option value="">None (Top Level)</option>
                  {allCategories
                    .filter((c) => c.id !== category?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
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
                ? "Update Category"
                : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

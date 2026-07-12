"use client"

import { useEffect } from "react"
import { useForm, useFieldArray, type Control, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { slugify, generateSku } from "@/lib/slugify"
import {
  createProductSchema,
  type CreateProductInput,
} from "@/lib/validations/product"
import { useCreateProduct, useUpdateProduct, useProduct } from "@/hooks/api/useProducts"
import { useCategories } from "@/hooks/api/useCategories"
import { useCollections } from "@/hooks/api/useCollections"
import { useLabels } from "@/hooks/api/useLabels"
import { usePresets } from "@/hooks/api/usePresets"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

interface ProductFormProps {
  productId?: number | null
}

export function ProductForm({ productId }: ProductFormProps) {
  const isEditing = !!productId
  const { closeModal } = usePageModal()
  const { data: existingProductResponse } = useProduct(productId ?? null)
  const existingProduct = existingProductResponse?.data
  const { data: allCategoriesResponse } = useCategories()
  const allCategories = allCategoriesResponse?.data || []
  const { data: allCollectionsResponse } = useCollections()
  const allCollections = allCollectionsResponse?.data || []
  const { data: allLabelsResponse } = useLabels()
  const allLabels = allLabelsResponse?.data || []
  const { data: variationPresetsResponse } = usePresets("variation")
  const variationPresets = variationPresetsResponse?.data || []
  const { data: modifierPresetsResponse } = usePresets("modifier")
  const modifierPresets = modifierPresetsResponse?.data || []
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as Resolver<CreateProductInput>,
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      basePrice: 0,
      compareAtPrice: undefined,
      sku: "",
      stock: 0,
      images: [],
      isActive: true,
      isFeatured: false,
      isOnPromotion: false,
      categoryIds: [],
      collectionIds: [],
      labelIds: [],
      variations: [],
      modifiers: [],
    },
  })

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors },
  } = form

  const {
    fields: variationFields,
    append: addVariation,
    remove: removeVariation,
    replace: replaceVariations,
  } = useFieldArray({ control, name: "variations" })

  const {
    fields: modifierFields,
    append: addModifier,
    remove: removeModifier,
    replace: replaceModifiers,
  } = useFieldArray({ control, name: "modifiers" })

  // Populate form when editing
  useEffect(() => {
    if (existingProduct && isEditing) {
      reset({
        name: existingProduct.name,
        slug: existingProduct.slug,
        description: existingProduct.description || "",
        basePrice: Number(existingProduct.basePrice),
        compareAtPrice: existingProduct.compareAtPrice
          ? Number(existingProduct.compareAtPrice)
          : undefined,
        sku: existingProduct.sku || "",
        stock: existingProduct.stock,
        images: existingProduct.images || [],
        isActive: existingProduct.isActive ?? true,
        isFeatured: existingProduct.isFeatured ?? false,
        isOnPromotion: existingProduct.isOnPromotion ?? false,
        categoryIds:
          existingProduct.productCategories?.map((pc) => pc.categoryId) || [],
        collectionIds:
          existingProduct.productCollections?.map((pc) => pc.collectionId) || [],
        labelIds:
          existingProduct.productLabels?.map((pl) => pl.labelId) || [],
        variations:
          existingProduct.variations?.map((v) => ({
            name: v.name,
            options: v.options,
          })) || [],
        modifiers:
          existingProduct.modifiers?.map((m) => ({
            name: m.name,
            required: m.required ?? false,
            priceAdjustment: Number(m.priceAdjustment),
          })) || [],
      })
    }
  }, [existingProduct, isEditing, reset])

  // Keep slug and SKU in sync with the product name
  const nameValue = watch("name")
  useEffect(() => {
    setValue("slug", slugify(nameValue || ""), {
      shouldValidate: false,
      shouldDirty: false,
    })
    setValue("sku", generateSku(nameValue || ""), {
      shouldValidate: false,
      shouldDirty: false,
    })
  }, [nameValue, setValue])

  const categoryIds = watch("categoryIds") || []
  const collectionIds = watch("collectionIds") || []
  const labelIds = watch("labelIds") || []

  const onSubmit = (data: CreateProductInput) => {
    const slug = slugify(data.name)
    if (!slug) {
      form.setError("name", {
        type: "manual",
        message: "Name must produce a valid slug",
      })
      return
    }
    const payload = {
      ...data,
      slug,
      sku: generateSku(data.name) || data.sku,
    }
    if (isEditing && productId) {
      updateMutation.mutate(
        { id: productId, ...payload },
        { onSuccess: () => closeModal() }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => closeModal() })
    }
  }

  const toggleArrayValue = (
    field: "categoryIds" | "collectionIds" | "labelIds",
    id: number
  ) => {
    const current = watch(field) || []
    if (current.includes(id)) {
      setValue(
        field,
        current.filter((v) => v !== id)
      )
    } else {
      setValue(field, [...current, id])
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const saveError = createMutation.error || updateMutation.error
    ? mutationErrorMessage(createMutation.error || updateMutation.error)
    : null

  const hasBasicErrors = Boolean(
    errors.name ||
      errors.basePrice ||
      errors.compareAtPrice ||
      errors.stock
  )
  const hasMediaErrors = Boolean(errors.images)
  const hasVariantErrors = Boolean(errors.variations || errors.modifiers)

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6" noValidate>
        <FormAlert errors={errors} serverError={saveError} />
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className={hasBasicErrors ? "text-destructive" : undefined}>
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="media" className={hasMediaErrors ? "text-destructive" : undefined}>
              Media
            </TabsTrigger>
            <TabsTrigger value="organize">Organize</TabsTrigger>
            <TabsTrigger value="variants" className={hasVariantErrors ? "text-destructive" : undefined}>
              Variants & Modifiers
            </TabsTrigger>
          </TabsList>

          {/* ─── BASIC INFO ─── */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Classic White T-Shirt" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
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
                      Generated automatically from the product name.
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this product..."
                        rows={4}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="basePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="compareAtPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare at Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Optional"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value
                            field.onChange(
                              v === "" || Number.isNaN(e.target.valueAsNumber)
                                ? undefined
                                : e.target.valueAsNumber
                            )
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU</FormLabel>
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
                        Generated automatically from the product name.
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Active</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div>
                          <FormLabel>Featured</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Show in Featured on the homepage
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="isOnPromotion"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div>
                          <FormLabel>On promotion</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Show in the On promotion section
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          {/* ─── MEDIA ─── */}
          <TabsContent value="media" className="space-y-4 pt-4">
            <FormField
              control={control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value || []}
                      onChange={(urls) => field.onChange(urls)}
                      multiple
                      maxFiles={8}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* ─── ORGANIZE ─── */}
          <TabsContent value="organize" className="space-y-6 pt-4">
            {/* Categories */}
            <div className="space-y-3">
              <Label>Categories</Label>
              {allCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No categories yet. Create one in the Categories page.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={categoryIds.includes(cat.id)}
                        onCheckedChange={() =>
                          toggleArrayValue("categoryIds", cat.id)
                        }
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Collections */}
            <div className="space-y-3">
              <Label>Collections</Label>
              {allCollections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No collections yet. Create one in the Collections page.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allCollections.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={collectionIds.includes(col.id)}
                        onCheckedChange={() =>
                          toggleArrayValue("collectionIds", col.id)
                        }
                      />
                      {col.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Labels */}
            <div className="space-y-3">
              <Label>Labels</Label>
              {allLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No labels yet. Create one in the Labels page.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allLabels.map((label) => (
                    <label
                      key={label.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={labelIds.includes(label.id)}
                        onCheckedChange={() =>
                          toggleArrayValue("labelIds", label.id)
                        }
                      />
                      <Badge
                        style={{
                          backgroundColor: label.color || "#6b7280",
                          color: "#fff",
                        }}
                      >
                        {label.name}
                      </Badge>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ─── VARIANTS & MODIFIERS ─── */}
          <TabsContent value="variants" className="space-y-6 pt-4">
            {/* Variations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Variations</Label>
                <div className="flex gap-2">
                  {variationPresets.length > 0 && (
                    <select
                      className="rounded-md border px-2 py-1 text-sm bg-background"
                      defaultValue=""
                      onChange={(e) => {
                        const preset = variationPresets.find(
                          (p) => p.id === Number(e.target.value)
                        )
                        if (preset?.data) {
                          replaceVariations(preset.data as CreateProductInput["variations"])
                        }
                        e.target.value = ""
                      }}
                    >
                      <option value="" disabled>
                        Load preset…
                      </option>
                      {variationPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addVariation({
                        name: "",
                        options: [{ name: "", priceAdjustment: 0, stock: 0 }],
                      })
                    }
                  >
                    + Add Variation
                  </Button>
                </div>
              </div>

              {variationFields.map((field, vIdx) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <FormField
                      control={control}
                      name={`variations.${vIdx}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Variation name (e.g. Size)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeVariation(vIdx)}
                      aria-label="Remove variation"
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                    </Button>
                  </div>
                  <VariationOptions
                    control={control}
                    variationIndex={vIdx}
                  />
                </div>
              ))}
            </div>

            <Separator />

            {/* Modifiers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Modifiers</Label>
                <div className="flex gap-2">
                  {modifierPresets.length > 0 && (
                    <select
                      className="rounded-md border px-2 py-1 text-sm bg-background"
                      defaultValue=""
                      onChange={(e) => {
                        const preset = modifierPresets.find(
                          (p) => p.id === Number(e.target.value)
                        )
                        if (preset?.data) {
                          replaceModifiers(preset.data as CreateProductInput["modifiers"])
                        }
                        e.target.value = ""
                      }}
                    >
                      <option value="" disabled>
                        Load preset…
                      </option>
                      {modifierPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addModifier({
                        name: "",
                        required: false,
                        priceAdjustment: 0,
                      })
                    }
                  >
                    + Add Modifier
                  </Button>
                </div>
              </div>

              {modifierFields.map((field, mIdx) => (
                <div
                  key={field.id}
                  className="space-y-2 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <FormField
                      control={control}
                      name={`modifiers.${mIdx}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Modifier name (e.g. Gift Wrap)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`modifiers.${mIdx}.priceAdjustment`}
                      render={({ field }) => (
                        <FormItem className="w-28">
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Price adj."
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`modifiers.${mIdx}.required`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">Required</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeModifier(mIdx)}
                      aria-label="Remove modifier"
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving…"
              : isEditing
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// ─── Sub-component for variation options ───
function VariationOptions({
  control,
  variationIndex,
}: {
  control: Control<CreateProductInput>
  variationIndex: number
}) {
  const {
    fields: optionFields,
    append: addOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `variations.${variationIndex}.options`,
  })

  return (
    <div className="space-y-2 pl-4 border-l-2">
      {optionFields.map((opt, oIdx) => (
        <div key={opt.id} className="space-y-1">
          <div className="flex items-center gap-2">
            <FormField
              control={control}
              name={`variations.${variationIndex}.options.${oIdx}.name`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Option (e.g. Small)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`variations.${variationIndex}.options.${oIdx}.priceAdjustment`}
              render={({ field }) => (
                <FormItem className="w-28">
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price adj."
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`variations.${variationIndex}.options.${oIdx}.stock`}
              render={({ field }) => (
                <FormItem className="w-24">
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => removeOption(oIdx)}
              aria-label="Remove option"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      <FormField
        control={control}
        name={`variations.${variationIndex}.options`}
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          addOption({ name: "", priceAdjustment: 0, stock: 0 })
        }
      >
        + Add Option
      </Button>
    </div>
  )
}

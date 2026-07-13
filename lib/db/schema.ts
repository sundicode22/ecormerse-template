import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  boolean,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import type { AdapterAccountType } from "next-auth/adapters"

// ==========================================
// AUTH TABLES
// ==========================================

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("user"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const addresses = pgTable("address", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").default("Home"),
  name: text("name").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postalCode").notNull(),
  country: text("country").notNull(),
  phone: text("phone"),
  isDefault: boolean("isDefault").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)

// ==========================================
// CATALOG TABLES
// ==========================================

export const categories = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: integer("parentId"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const collections = pgTable("collection", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const labels = pgTable("label", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#6b7280"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const products = pgTable("product", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  sku: text("sku"),
  stock: integer("stock").notNull().default(0),
  images: jsonb("images").$type<string[]>().default([]),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  isOnPromotion: boolean("isOnPromotion").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ==========================================
// JUNCTION TABLES
// ==========================================

export const productCategories = pgTable(
  "productCategory",
  {
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: integer("categoryId")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.categoryId] }),
  })
)

export const productCollections = pgTable(
  "productCollection",
  {
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: integer("collectionId")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.collectionId] }),
  })
)

export const productLabels = pgTable(
  "productLabel",
  {
    productId: integer("productId")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    labelId: integer("labelId")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.productId, t.labelId] }),
  })
)

// ==========================================
// VARIATIONS & MODIFIERS
// ==========================================

export const presets = pgTable("preset", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "variation" | "modifier"
  data: jsonb("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
})

export const productVariations = pgTable("productVariation", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Size", "Color"
  options: jsonb("options")
    .notNull()
    .$type<{ name: string; priceAdjustment: number; stock: number }[]>(),
})

export const productModifiers = pgTable("productModifier", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Gift Wrap", "Express Processing"
  required: boolean("required").default(false),
  priceAdjustment: decimal("priceAdjustment", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
})

// ==========================================
// ORDERS
// ==========================================

export const orders = pgTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, awaiting_payment, paid, processing, shipped, delivered, cancelled
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  deliveryType: text("deliveryType").notNull().default("pickup"), // pickup, local, international
  paymentMethod: text("paymentMethod").notNull().default("whatsapp"), // mtn, orange, whatsapp
  paymentPhone: text("paymentPhone"), // customer MTN / Orange number
  shippingAddress: jsonb("shippingAddress").$type<{
    name: string
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  }>(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

export const orderItems = pgTable("orderItem", {
  id: serial("id").primaryKey(),
  orderId: text("orderId")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("productId")
    .notNull()
    .references(() => products.id),
  productName: text("productName"),
  productSlug: text("productSlug"),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  selectedVariations: jsonb("selectedVariations").$type<
    Record<string, string>
  >(),
  selectedModifiers: jsonb("selectedModifiers").$type<string[]>(),
})

// ==========================================
// REVIEWS
// ==========================================

export const reviews = pgTable("review", {
  id: serial("id").primaryKey(),
  productId: integer("productId")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  authorName: text("authorName").notNull(),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  isPublished: boolean("isPublished").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
})

// ==========================================
// RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  orders: many(orders),
  reviews: many(reviews),
  addresses: many(addresses),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  productCategories: many(productCategories),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}))

export const collectionsRelations = relations(collections, ({ many }) => ({
  productCollections: many(productCollections),
}))

export const labelsRelations = relations(labels, ({ many }) => ({
  productLabels: many(productLabels),
}))

export const productsRelations = relations(products, ({ many }) => ({
  productCategories: many(productCategories),
  productCollections: many(productCollections),
  productLabels: many(productLabels),
  variations: many(productVariations),
  modifiers: many(productModifiers),
  orderItems: many(orderItems),
  reviews: many(reviews),
}))

export const productCategoriesRelations = relations(
  productCategories,
  ({ one }) => ({
    product: one(products, {
      fields: [productCategories.productId],
      references: [products.id],
    }),
    category: one(categories, {
      fields: [productCategories.categoryId],
      references: [categories.id],
    }),
  })
)

export const productCollectionsRelations = relations(
  productCollections,
  ({ one }) => ({
    product: one(products, {
      fields: [productCollections.productId],
      references: [products.id],
    }),
    collection: one(collections, {
      fields: [productCollections.collectionId],
      references: [collections.id],
    }),
  })
)

export const productLabelsRelations = relations(
  productLabels,
  ({ one }) => ({
    product: one(products, {
      fields: [productLabels.productId],
      references: [products.id],
    }),
    label: one(labels, {
      fields: [productLabels.labelId],
      references: [labels.id],
    }),
  })
)

export const productVariationsRelations = relations(
  productVariations,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariations.productId],
      references: [products.id],
    }),
  })
)

export const productModifiersRelations = relations(
  productModifiers,
  ({ one }) => ({
    product: one(products, {
      fields: [productModifiers.productId],
      references: [products.id],
    }),
  })
)

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}))

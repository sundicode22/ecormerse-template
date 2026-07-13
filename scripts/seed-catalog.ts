import "dotenv/config"
import { eq, inArray } from "drizzle-orm"
import { closeDb, db } from "../lib/db"
import {
  categories,
  collections,
  labels,
  products,
  productCategories,
  productCollections,
  productLabels,
  productVariations,
} from "../lib/db/schema"
import { generateSku, slugify } from "../lib/slugify"

type SeedCategory = {
  name: string
  description: string
  image: string
}

type SeedCollection = {
  name: string
  description: string
  image: string
}

type SeedLabel = {
  name: string
  color: string
}

type SeedProduct = {
  name: string
  description: string
  basePrice: string
  compareAtPrice?: string
  stock: number
  images: string[]
  isActive?: boolean
  isFeatured?: boolean
  isOnPromotion?: boolean
  categoryNames: string[]
  collectionNames: string[]
  labelNames?: string[]
  sizes?: string[]
  colors?: string[]
}

const CATEGORY_SEEDS: SeedCategory[] = [
  {
    name: "Tops",
    description: "Shirts, tees, and everyday layers.",
    image:
      "https://images.unsplash.com/photo-1521572163474-68541b414f73?w=800&q=80",
  },
  {
    name: "Bottoms",
    description: "Trousers, denim, and tailored pants.",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
  },
  {
    name: "Outerwear",
    description: "Jackets and coats for transitional weather.",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
  },
  {
    name: "Dresses",
    description: "Day dresses and evening silhouettes.",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
  },
  {
    name: "Knitwear",
    description: "Sweaters, cardigans, and soft knits.",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  },
  {
    name: "Accessories",
    description: "Bags, belts, and finishing pieces.",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
  },
  {
    name: "Footwear",
    description: "Sneakers, boots, and everyday shoes.",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
  },
  {
    name: "Loungewear",
    description: "Relaxed sets for home and travel.",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
  },
]

const COLLECTION_SEEDS: SeedCollection[] = [
  {
    name: "New Arrivals",
    description: "Just dropped — the latest from Sundi Buy.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  },
  {
    name: "Essentials",
    description: "Wardrobe foundations you reach for daily.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
  },
  {
    name: "Summer Edit",
    description: "Light fabrics and warm-weather color.",
    image:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
  },
  {
    name: "Workwear",
    description: "Polished pieces for the office and beyond.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  },
  {
    name: "Weekend",
    description: "Easy silhouettes for off-duty days.",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b69274e9c2?w=800&q=80",
  },
  {
    name: "Limited Drop",
    description: "Short-run styles, while they last.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  },
  {
    name: "Monochrome",
    description: "Black, white, and everything in between.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  },
  {
    name: "Gift Guide",
    description: "Pieces worth wrapping.",
    image:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80",
  },
]

const LABEL_SEEDS: SeedLabel[] = [
  { name: "Bestseller", color: "#8b2be2" },
  { name: "New", color: "#2563eb" },
  { name: "Sale", color: "#dc2626" },
  { name: "Limited", color: "#b45309" },
  { name: "Organic", color: "#16a34a" },
]

const SIZES = ["XS", "S", "M", "L", "XL"]
const COLORS = ["Black", "White", "Navy", "Beige", "Olive"]

const PRODUCT_SEEDS: SeedProduct[] = [
  {
    name: "Classic Cotton Tee",
    description: "Soft midweight cotton with a clean crew neck.",
    basePrice: "28.00",
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1521572163474-68541b414f73?w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Tops"],
    collectionNames: ["Essentials", "New Arrivals"],
    labelNames: ["Bestseller", "New"],
    sizes: SIZES,
    colors: ["Black", "White", "Navy"],
  },
  {
    name: "Relaxed Oxford Shirt",
    description: "Breathable oxford cloth with a slightly boxy fit.",
    basePrice: "68.00",
    stock: 64,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Tops"],
    collectionNames: ["Workwear", "Essentials"],
    labelNames: ["New"],
    sizes: SIZES,
    colors: ["White", "Beige", "Navy"],
  },
  {
    name: "Ribbed Tank",
    description: "Fine rib tank for layering or solo wear.",
    basePrice: "24.00",
    stock: 90,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
    ],
    categoryNames: ["Tops"],
    collectionNames: ["Summer Edit", "Essentials"],
    sizes: ["S", "M", "L"],
    colors: ["Black", "White"],
  },
  {
    name: "Linen Camp Collar Shirt",
    description: "Open collar linen for warm days.",
    basePrice: "72.00",
    compareAtPrice: "89.00",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80",
    ],
    isOnPromotion: true,
    categoryNames: ["Tops"],
    collectionNames: ["Summer Edit", "Weekend"],
    labelNames: ["Sale"],
    sizes: SIZES,
    colors: ["Beige", "Olive", "White"],
  },
  {
    name: "Straight Leg Denim",
    description: "Classic straight jean in rigid cotton denim.",
    basePrice: "98.00",
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
      "https://images.unsplash.com/photo-1475178626620-a4d074967337?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Bottoms"],
    collectionNames: ["Essentials", "Weekend"],
    labelNames: ["Bestseller"],
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Navy", "Black"],
  },
  {
    name: "Pleated Wide Trouser",
    description: "Fluid wide-leg trouser with soft pleats.",
    basePrice: "110.00",
    stock: 38,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80",
    ],
    categoryNames: ["Bottoms"],
    collectionNames: ["Workwear", "Monochrome"],
    sizes: SIZES,
    colors: ["Black", "Beige"],
  },
  {
    name: "Utility Cargo Pant",
    description: "Relaxed cargo with functional pockets.",
    basePrice: "92.00",
    stock: 47,
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
    ],
    categoryNames: ["Bottoms"],
    collectionNames: ["Weekend", "Limited Drop"],
    labelNames: ["Limited"],
    sizes: SIZES,
    colors: ["Olive", "Black"],
  },
  {
    name: "Tailored Chino",
    description: "Slim chino with stretch for all-day wear.",
    basePrice: "78.00",
    stock: 70,
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
    ],
    categoryNames: ["Bottoms"],
    collectionNames: ["Workwear", "Essentials"],
    sizes: SIZES,
    colors: ["Beige", "Navy", "Olive"],
  },
  {
    name: "Wool Blend Overcoat",
    description: "Double-faced overcoat with a clean lapel.",
    basePrice: "248.00",
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Outerwear"],
    collectionNames: ["Limited Drop", "Gift Guide"],
    labelNames: ["Limited"],
    sizes: SIZES,
    colors: ["Black", "Beige"],
  },
  {
    name: "Cropped Bomber",
    description: "Lightweight bomber with ribbed cuffs.",
    basePrice: "145.00",
    compareAtPrice: "175.00",
    stock: 31,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    ],
    isOnPromotion: true,
    categoryNames: ["Outerwear"],
    collectionNames: ["New Arrivals", "Weekend"],
    labelNames: ["Sale", "New"],
    sizes: SIZES,
    colors: ["Black", "Olive", "Navy"],
  },
  {
    name: "Technical Rain Shell",
    description: "Water-resistant shell with a packable hood.",
    basePrice: "168.00",
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd62818?w=800&q=80",
    ],
    categoryNames: ["Outerwear"],
    collectionNames: ["Weekend", "Essentials"],
    sizes: SIZES,
    colors: ["Black", "Navy"],
  },
  {
    name: "Slip Midi Dress",
    description: "Bias-cut midi with adjustable straps.",
    basePrice: "118.00",
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Dresses"],
    collectionNames: ["Summer Edit", "Gift Guide"],
    labelNames: ["Bestseller"],
    sizes: SIZES,
    colors: ["Black", "Beige"],
  },
  {
    name: "Poplin Shirt Dress",
    description: "Crisp poplin dress with a removable belt.",
    basePrice: "98.00",
    stock: 42,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
    ],
    categoryNames: ["Dresses"],
    collectionNames: ["Workwear", "New Arrivals"],
    labelNames: ["New"],
    sizes: SIZES,
    colors: ["White", "Navy"],
  },
  {
    name: "Knit Column Dress",
    description: "Body-skimming knit dress in stretch jersey.",
    basePrice: "88.00",
    compareAtPrice: "108.00",
    stock: 33,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
    ],
    isOnPromotion: true,
    categoryNames: ["Dresses", "Knitwear"],
    collectionNames: ["Monochrome", "Essentials"],
    labelNames: ["Sale"],
    sizes: SIZES,
    colors: ["Black"],
  },
  {
    name: "Merino Crew Sweater",
    description: "Fine-gauge merino with a neat crew neck.",
    basePrice: "120.00",
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Knitwear"],
    collectionNames: ["Essentials", "Gift Guide"],
    labelNames: ["Organic", "Bestseller"],
    sizes: SIZES,
    colors: ["Black", "Beige", "Navy"],
  },
  {
    name: "Chunky Cable Cardigan",
    description: "Open-front cable knit for cool evenings.",
    basePrice: "135.00",
    stock: 27,
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
    ],
    categoryNames: ["Knitwear"],
    collectionNames: ["Weekend", "New Arrivals"],
    labelNames: ["New"],
    sizes: SIZES,
    colors: ["Beige", "Olive"],
  },
  {
    name: "Cashmere Blend Beanie",
    description: "Soft rolled-edge beanie.",
    basePrice: "42.00",
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80",
    ],
    categoryNames: ["Accessories", "Knitwear"],
    collectionNames: ["Gift Guide", "Essentials"],
    labelNames: ["Organic"],
    colors: ["Black", "Beige", "Olive"],
  },
  {
    name: "Structured Crossbody",
    description: "Compact leather-look crossbody with a zip top.",
    basePrice: "86.00",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Accessories"],
    collectionNames: ["Gift Guide", "Workwear"],
    labelNames: ["Bestseller"],
    colors: ["Black", "Beige"],
  },
  {
    name: "Wide Leather Belt",
    description: "Smooth leather belt with a matte buckle.",
    basePrice: "48.00",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    ],
    categoryNames: ["Accessories"],
    collectionNames: ["Essentials", "Workwear"],
    sizes: ["S", "M", "L"],
    colors: ["Black", "Beige"],
  },
  {
    name: "Silk Scarf",
    description: "Printed square scarf in lightweight silk.",
    basePrice: "54.00",
    stock: 52,
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80",
    ],
    categoryNames: ["Accessories"],
    collectionNames: ["Gift Guide", "Summer Edit"],
    labelNames: ["New"],
  },
  {
    name: "Court Sneaker",
    description: "Low-profile leather court sneaker.",
    basePrice: "110.00",
    stock: 58,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Footwear"],
    collectionNames: ["Essentials", "Weekend"],
    labelNames: ["Bestseller"],
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["White", "Black"],
  },
  {
    name: "Chelsea Boot",
    description: "Sleek Chelsea boot on a stacked sole.",
    basePrice: "168.00",
    stock: 36,
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80",
    ],
    categoryNames: ["Footwear"],
    collectionNames: ["Workwear", "Monochrome"],
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Black"],
  },
  {
    name: "Trail Runner",
    description: "Lightweight runner with a grippy outsole.",
    basePrice: "128.00",
    compareAtPrice: "148.00",
    stock: 44,
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    ],
    isOnPromotion: true,
    categoryNames: ["Footwear"],
    collectionNames: ["Weekend", "New Arrivals"],
    labelNames: ["Sale", "New"],
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Black", "Olive"],
  },
  {
    name: "Modal Lounge Set",
    description: "Two-piece modal set with a soft drape.",
    basePrice: "95.00",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    ],
    categoryNames: ["Loungewear"],
    collectionNames: ["Weekend", "Gift Guide"],
    labelNames: ["Organic"],
    sizes: SIZES,
    colors: ["Beige", "Black", "Olive"],
  },
  {
    name: "Fleece Zip Hoodie",
    description: "Brushed fleece hoodie with a full zip.",
    basePrice: "78.00",
    stock: 66,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    ],
    categoryNames: ["Loungewear", "Tops"],
    collectionNames: ["Weekend", "Essentials"],
    sizes: SIZES,
    colors: ["Black", "Navy", "Olive"],
  },
  {
    name: "Relaxed Sweatpant",
    description: "Tapered sweatpant with an elastic cuff.",
    basePrice: "64.00",
    stock: 72,
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa78283?w=800&q=80",
    ],
    categoryNames: ["Loungewear", "Bottoms"],
    collectionNames: ["Weekend", "Essentials"],
    sizes: SIZES,
    colors: ["Black", "Beige", "Navy"],
  },
  {
    name: "Boxy Crop Tee",
    description: "Short-sleeve boxy tee with a dropped shoulder.",
    basePrice: "32.00",
    stock: 88,
    images: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
    ],
    categoryNames: ["Tops"],
    collectionNames: ["Summer Edit", "Monochrome"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["White", "Black"],
  },
  {
    name: "Satin Slip Skirt",
    description: "Bias slip skirt that hits mid-calf.",
    basePrice: "76.00",
    stock: 39,
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80",
    ],
    categoryNames: ["Bottoms"],
    collectionNames: ["Summer Edit", "Limited Drop"],
    labelNames: ["Limited"],
    sizes: SIZES,
    colors: ["Black", "Beige"],
  },
  {
    name: "Denim Trucker Jacket",
    description: "Classic trucker in mid-wash denim.",
    basePrice: "128.00",
    stock: 34,
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
    ],
    isFeatured: true,
    categoryNames: ["Outerwear"],
    collectionNames: ["Essentials", "Weekend"],
    labelNames: ["Bestseller"],
    sizes: SIZES,
    colors: ["Navy"],
  },
  {
    name: "Piqué Polo",
    description: "Cotton piqué polo with a refined collar.",
    basePrice: "55.00",
    stock: 74,
    images: [
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc543d?w=800&q=80",
    ],
    categoryNames: ["Tops"],
    collectionNames: ["Workwear", "Summer Edit"],
    sizes: SIZES,
    colors: ["Navy", "White", "Black"],
  },
  {
    name: "Quilted Vest",
    description: "Lightweight quilted vest for layering.",
    basePrice: "98.00",
    stock: 29,
    images: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    ],
    categoryNames: ["Outerwear"],
    collectionNames: ["Weekend", "New Arrivals"],
    labelNames: ["New"],
    sizes: SIZES,
    colors: ["Black", "Olive"],
  },
  {
    name: "Halter Mini Dress",
    description: "Clean halter mini for warm nights.",
    basePrice: "84.00",
    compareAtPrice: "98.00",
    stock: 26,
    images: [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
    ],
    isOnPromotion: true,
    categoryNames: ["Dresses"],
    collectionNames: ["Summer Edit", "Limited Drop"],
    labelNames: ["Sale", "Limited"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black"],
  },
  {
    name: "Turtleneck Knit",
    description: "Close-fit turtleneck in soft wool blend.",
    basePrice: "88.00",
    stock: 48,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    ],
    categoryNames: ["Knitwear", "Tops"],
    collectionNames: ["Monochrome", "Essentials"],
    sizes: SIZES,
    colors: ["Black", "White", "Beige"],
  },
  {
    name: "Canvas Tote",
    description: "Heavyweight canvas tote with interior pocket.",
    basePrice: "38.00",
    stock: 95,
    images: [
      "https://images.unsplash.com/photo-1597484661643-2d06c4c5050a?w=800&q=80",
    ],
    categoryNames: ["Accessories"],
    collectionNames: ["Essentials", "Gift Guide"],
    labelNames: ["Organic"],
    colors: ["Beige", "Black"],
  },
  {
    name: "Suede Loafer",
    description: "Soft suede loafer with a leather sole.",
    basePrice: "142.00",
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80",
    ],
    categoryNames: ["Footwear"],
    collectionNames: ["Workwear", "Gift Guide"],
    sizes: ["39", "40", "41", "42", "43"],
    colors: ["Beige", "Black"],
  },
  {
    name: "Jersey Short",
    description: "Mid-thigh jersey short with drawcord.",
    basePrice: "42.00",
    stock: 81,
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
    ],
    categoryNames: ["Loungewear", "Bottoms"],
    collectionNames: ["Summer Edit", "Weekend"],
    sizes: SIZES,
    colors: ["Black", "Navy", "Olive"],
  },
]

async function upsertCategory(seed: SeedCategory) {
  const slug = slugify(seed.name)
  const [row] = await db
    .insert(categories)
    .values({
      name: seed.name,
      slug,
      description: seed.description,
      image: seed.image,
    })
    .onConflictDoUpdate({
      target: categories.slug,
      set: {
        name: seed.name,
        description: seed.description,
        image: seed.image,
        updatedAt: new Date(),
      },
    })
    .returning()
  return row
}

async function upsertCollection(seed: SeedCollection) {
  const slug = slugify(seed.name)
  const [row] = await db
    .insert(collections)
    .values({
      name: seed.name,
      slug,
      description: seed.description,
      image: seed.image,
    })
    .onConflictDoUpdate({
      target: collections.slug,
      set: {
        name: seed.name,
        description: seed.description,
        image: seed.image,
        updatedAt: new Date(),
      },
    })
    .returning()
  return row
}

async function upsertLabel(seed: SeedLabel) {
  const existing = await db.query.labels.findFirst({
    where: eq(labels.name, seed.name),
  })
  if (existing) {
    const [updated] = await db
      .update(labels)
      .set({ color: seed.color, updatedAt: new Date() })
      .where(eq(labels.id, existing.id))
      .returning()
    return updated
  }
  const [created] = await db.insert(labels).values(seed).returning()
  return created
}

async function seedCatalog() {
  console.log("Seeding catalog…")

  const categoryMap = new Map<string, number>()
  for (const seed of CATEGORY_SEEDS) {
    const row = await upsertCategory(seed)
    categoryMap.set(row.name, row.id)
  }
  console.log(`  categories: ${categoryMap.size}`)

  const collectionMap = new Map<string, number>()
  for (const seed of COLLECTION_SEEDS) {
    const row = await upsertCollection(seed)
    collectionMap.set(row.name, row.id)
  }
  console.log(`  collections: ${collectionMap.size}`)

  const labelMap = new Map<string, number>()
  for (const seed of LABEL_SEEDS) {
    const row = await upsertLabel(seed)
    labelMap.set(row.name, row.id)
  }
  console.log(`  labels: ${labelMap.size}`)

  const productRows = []
  for (const seed of PRODUCT_SEEDS) {
    const slug = slugify(seed.name)
    const [row] = await db
      .insert(products)
      .values({
        name: seed.name,
        slug,
        description: seed.description,
        basePrice: seed.basePrice,
        compareAtPrice: seed.compareAtPrice ?? null,
        sku: generateSku(seed.name),
        stock: seed.stock,
        images: seed.images,
        isActive: seed.isActive ?? true,
        isFeatured: seed.isFeatured ?? false,
        isOnPromotion: seed.isOnPromotion ?? false,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: seed.name,
          description: seed.description,
          basePrice: seed.basePrice,
          compareAtPrice: seed.compareAtPrice ?? null,
          sku: generateSku(seed.name),
          stock: seed.stock,
          images: seed.images,
          isActive: seed.isActive ?? true,
          isFeatured: seed.isFeatured ?? false,
          isOnPromotion: seed.isOnPromotion ?? false,
          updatedAt: new Date(),
        },
      })
      .returning()

    productRows.push({ seed, product: row })
    console.log(`  product: ${row.name}`)
  }

  const productIds = productRows.map(({ product }) => product.id)

  if (productIds.length) {
    await db
      .delete(productCategories)
      .where(inArray(productCategories.productId, productIds))
    await db
      .delete(productCollections)
      .where(inArray(productCollections.productId, productIds))
    await db
      .delete(productLabels)
      .where(inArray(productLabels.productId, productIds))
    await db
      .delete(productVariations)
      .where(inArray(productVariations.productId, productIds))
  }

  const categoryLinks = []
  const collectionLinks = []
  const labelLinks = []
  const variationRows = []

  for (const { seed, product } of productRows) {
    for (const name of seed.categoryNames) {
      const categoryId = categoryMap.get(name)
      if (categoryId) {
        categoryLinks.push({ productId: product.id, categoryId })
      }
    }
    for (const name of seed.collectionNames) {
      const collectionId = collectionMap.get(name)
      if (collectionId) {
        collectionLinks.push({ productId: product.id, collectionId })
      }
    }
    for (const name of seed.labelNames || []) {
      const labelId = labelMap.get(name)
      if (labelId) {
        labelLinks.push({ productId: product.id, labelId })
      }
    }
    if (seed.sizes?.length) {
      variationRows.push({
        productId: product.id,
        name: "Size",
        options: seed.sizes.map((name) => ({
          name,
          priceAdjustment: 0,
          stock: Math.max(2, Math.floor(seed.stock / seed.sizes!.length)),
        })),
      })
    }
    if (seed.colors?.length) {
      variationRows.push({
        productId: product.id,
        name: "Color",
        options: seed.colors.map((name) => ({
          name,
          priceAdjustment: 0,
          stock: Math.max(2, Math.floor(seed.stock / seed.colors!.length)),
        })),
      })
    }
  }

  if (categoryLinks.length) await db.insert(productCategories).values(categoryLinks)
  if (collectionLinks.length) {
    await db.insert(productCollections).values(collectionLinks)
  }
  if (labelLinks.length) await db.insert(productLabels).values(labelLinks)
  if (variationRows.length) await db.insert(productVariations).values(variationRows)

  console.log(`  products: ${productRows.length}`)
  console.log("Catalog seed complete.")
  await closeDb()
  process.exit(0)
}

seedCatalog().catch(async (error) => {
  console.error("Failed to seed catalog:", error)
  try {
    await closeDb()
  } catch {
    // ignore close errors
  }
  process.exit(1)
})

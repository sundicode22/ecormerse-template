import "dotenv/config"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { closeDb, db } from "../lib/db"
import { users } from "../lib/db/schema"
import { ROLES } from "../lib/auth/roles"

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@saakinun.com"
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin123!"
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || "Saakinun Admin"

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const existing = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  })

  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        name: ADMIN_NAME,
        password: passwordHash,
        role: ROLES.ADMIN,
      })
      .where(eq(users.id, existing.id))
      .returning()

    console.log("Admin updated:")
    console.log(`  id:    ${updated.id}`)
    console.log(`  email: ${updated.email}`)
    console.log(`  role:  ${updated.role}`)
  } else {
    const [created] = await db
      .insert(users)
      .values({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: passwordHash,
        role: ROLES.ADMIN,
      })
      .returning()

    console.log("Admin created:")
    console.log(`  id:    ${created.id}`)
    console.log(`  email: ${created.email}`)
    console.log(`  role:  ${created.role}`)
  }

  console.log(`  password: ${ADMIN_PASSWORD}`)
  await closeDb()
  process.exit(0)
}

seedAdmin().catch(async (error) => {
  console.error("Failed to seed admin:", error)
  try {
    await closeDb()
  } catch {
    // ignore
  }
  process.exit(1)
})


import { db } from "@/drizzle/db"
import { UsersTable } from "@/drizzle/schema"
import { CACHE_TAGS, dbCache, getUserTag, revalidateDbCache } from "@/lib/cache"
import { SQL } from "drizzle-orm"

export async function createUser(
  data: typeof UsersTable.$inferInsert
) {
  const [newUser] = await db
    .insert(UsersTable)
    .values(data)
    .onConflictDoNothing({
      target: UsersTable.clerkUserId,
    })
    .returning({
      id: UsersTable.id,
      userId: UsersTable.clerkUserId,
    })

  if (newUser != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      id: newUser.id,
      userId: newUser.userId,
    })
  }

  return newUser
}

export function getUser(userId: string) {
  const cacheFn = dbCache(getUserInternal, {
    tags: [getUserTag(userId, CACHE_TAGS.users)],
  })

  return cacheFn(userId)
}

export async function updateUser(
  where: SQL,
  data: Partial<typeof UsersTable.$inferInsert>
) {
  const [updatedUser] = await db
    .update(UsersTable)
    .set(data)
    .where(where)
    .returning({
      id: UsersTable.id,
      userId: UsersTable.clerkUserId,
    })

  if (updatedUser != null) {
    revalidateDbCache({
      tag: CACHE_TAGS.users,
      userId: updatedUser.userId,
      id: updatedUser.id,
    })
  }
}

// export async function getUserSubscriptionTier(userId: string) {
//   const subscription = await getUserSubscription(userId)

//   if (subscription == null) throw new Error("User has no subscription")

//   return subscriptionTiers[subscription.tier]
// }

function getUserInternal(userId: string) {
  return db.query.UsersTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
  })
}

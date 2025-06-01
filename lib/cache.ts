// lib/cache.ts
import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

// Define the types of cache tags that can be used.
// This ensures type safety when working with tags.
export type ValidTags =
  | ReturnType<typeof getGlobalTag>
  | ReturnType<typeof getUserTag>
  | ReturnType<typeof getIdTag>;

// Define the base cache tags for different entities in your application.
// These are used to categorize cached data.
export const CACHE_TAGS = {
  users: "users",
  communities: "communities",
  pickups: "pickups",
  badges: "badges",
  userBadges: "userBadges", // For the many-to-many relationship table
  activities: "activities", // <--- ADD THIS LINE
} as const; // `as const` makes the values literal types, improving type inference.

/**
 * Generates a global cache tag for a given entity type.
 * This tag is used to revalidate all cached data for that entity across the application.
 * @param tag The base tag from CACHE_TAGS (e.g., "products", "users").
 * @returns A string representing the global cache tag (e.g., "global:users").
 */
export function getGlobalTag(tag: keyof typeof CACHE_TAGS) {
  return `global:${CACHE_TAGS[tag]}` as const;
}

/**
 * Generates a user-specific cache tag for a given entity type.
 * This tag is used to revalidate cached data specific to a particular user.
 * @param userId The unique identifier of the user.
 * @param tag The base tag from CACHE_TAGS.
 * @returns A string representing the user-specific cache tag (e.g., "user:clerkUserId-users").
 */
export function getUserTag(userId: string, tag: keyof typeof CACHE_TAGS) {
  return `user:${userId}-${CACHE_TAGS[tag]}` as const;
}

/**
 * Generates an ID-specific cache tag for a given entity type.
 * This tag is used to revalidate cached data for a single, specific item.
 * @param id The unique identifier of the item (e.g., product ID, community ID).
 * @param tag The base tag from CACHE_TAGS.
 * @returns A string representing the ID-specific cache tag (e.g., "id:itemId-pickups").
 */
export function getIdTag(id: string, tag: keyof typeof CACHE_TAGS) {
  return `id:${id}-${CACHE_TAGS[tag]}` as const;
}

/**
 * Revalidates the entire Next.js data cache.
 * Use with caution, as this can impact performance by forcing all cached data to be refetched.
 */
export function clearFullCache() {
  revalidateTag("*"); // The "*" tag invalidates all cached data.
}

/**
 * A higher-order function that wraps a database fetching function with Next.js's `unstable_cache`.
 * This enables caching of the function's results.
 * @param cb The asynchronous function that performs the database query.
 * @param tags An array of `ValidTags` to associate with the cached data.
 * @returns A cached version of the provided callback function.
 */
export function dbCache<T extends (...args: any[]) => Promise<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  cb: Parameters<typeof unstable_cache<T>>[0],
  { tags }: { tags: ValidTags[] }
) {
  // `cache` from 'react' memoizes the `unstable_cache` wrapper itself for the duration of a single server request.
  // `unstable_cache` from 'next/cache' performs the actual data caching across requests.
  // The wildcard tag "*" is added to ensure `clearFullCache()` can invalidate this entry.
  return cache(unstable_cache<T>(cb, undefined, { tags: [...tags, "*"] }));
}

/**
 * Revalidates specific cache tags after a data mutation (create, update, delete).
 * It intelligently revalidates global, user-specific, and ID-specific tags.
 * @param tag The base tag from CACHE_TAGS indicating the type of entity that was mutated.
 * @param userId Optional. The ID of the user associated with the mutation.
 * @param id Optional. The ID of the specific item that was mutated.
 */
export function revalidateDbCache({
  tag,
  userId,
  id,
}: {
  tag: keyof typeof CACHE_TAGS;
  userId?: string;
  id?: string;
}) {
  // Always revalidate the global tag for the entity type.
  revalidateTag(getGlobalTag(tag));

  // If a userId is provided, revalidate the user-specific tag.
  if (userId != null) {
    revalidateTag(getUserTag(userId, tag));
  }

  // If an id is provided, revalidate the ID-specific tag.
  if (id != null) {
    revalidateTag(getIdTag(id, tag));
  }
}
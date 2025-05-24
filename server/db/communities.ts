import { db } from "@/drizzle/db"
import { CommunitiesTable } from "@/drizzle/schema"
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache"
import { eq } from "drizzle-orm"


export async function createCommunity(
    data: typeof CommunitiesTable.$inferInsert
) {
    // Check if a community with the same name already exists
    const existing = await db
        .select({ id: CommunitiesTable.id })
        .from(CommunitiesTable)
        .where(eq(CommunitiesTable.name, data.name))
        .limit(1);

    if (existing.length > 0) {
        throw new Error("A community with this name already exists.");
    }

    const [newCommunity] = await db
        .insert(CommunitiesTable)
        .values(data)
        .returning({
            id: CommunitiesTable.id,
            name: CommunitiesTable.name,
        });

    if (newCommunity != null) {
        revalidateDbCache({
            tag: CACHE_TAGS.communities,
            id: newCommunity.id
        });
    }

    return newCommunity;
}



"use server"

import {
CommunitiesSchema
} from "@/schema/communities"

import { z } from "zod"
import {
    createCommunity as createCommunityDb,

} from "@/server/db/communities"
import { redirect } from "next/navigation"


export async function createCommunity(
  unsafeData: z.infer<typeof CommunitiesSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { success, data } = CommunitiesSchema.safeParse(unsafeData)

  if (!success) {
    return { error: true, message: "There was an error creating your product" }
  }

  try {
    const { id } = await createCommunityDb(data )
    console.log("Community created with ID:", id)
    redirect("/dashboard")
    // redirect(`/dashboard/communities/${id}/edit`)
  } catch (error) {
    if (error instanceof Error && error.message === "A community with this name already exists.") {
      return { 
        error: true, 
        message: "A community with this name already exists. Please choose a different name." 
      }
    }
    // Handle other potential errors
    return { 
      error: true, 
      message: "An unexpected error occurred while creating the community." 
    }
  }
}

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { createUser, updateUser } from "@/server/db/user";
import { eq } from "drizzle-orm"
import type { NextRequest } from "next/server";
import { generateUsername } from "@/lib/formatters";
import crypto from "crypto"; // Import the crypto module for Gravatar fallback
import { UsersTable } from "@/drizzle/schema";

export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req as NextRequest);
    const eventType = evt.type;

    switch (eventType) {
      case "user.created": {
        const firstName = evt.data.first_name || "User";
        const lastName = evt.data.last_name || "Unknown";
        const username = generateUsername(firstName, lastName);

        const emailAddresses = evt.data.email_addresses;
        const email = emailAddresses.find(e => e.id === evt.data.primary_email_address_id)?.email_address || emailAddresses[0]?.email_address;

        // --- Determine avatar_url priority: Clerk's social image > Gravatar > Generic Fallback ---
        let avatar_url: string | undefined = evt.data.image_url; // 1. Try Clerk's provided profile image first

        if (!avatar_url && email) {
          // 2. If no Clerk profile image, try Gravatar
          const trimmedEmail = email.trim().toLowerCase();
          const md5Hash = crypto.createHash('md5').update(trimmedEmail).digest('hex');
          avatar_url = `https://www.gravatar.com/avatar/${md5Hash}?d=identicon&s=200`;
        }

        // 3. Fallback to a generic default if neither is available
        avatar_url = avatar_url || "https://example.com/default-avatar.png"; // Your generic default URL

        await createUser({
          clerkUserId: evt.data.id,
          username: username,
          avatar_url: avatar_url,
        });
        break;
      }

      case "user.updated": {
        const firstName = evt.data.first_name || "User";
        const lastName = evt.data.last_name || "Unknown";
        const username = generateUsername(firstName, lastName);

        const emailAddresses = evt.data.email_addresses;
        const email = emailAddresses.find(e => e.id === evt.data.primary_email_address_id)?.email_address || emailAddresses[0]?.email_address;

        let updatedAvatarUrl: string | undefined = evt.data.image_url; // Try Clerk's provided image first

        if (!updatedAvatarUrl && email) {
          const trimmedEmail = email.trim().toLowerCase();
          const md5Hash = crypto.createHash('md5').update(trimmedEmail).digest('hex');
          updatedAvatarUrl = `https://www.gravatar.com/avatar/${md5Hash}?d=identicon&s=200`;
        }
        updatedAvatarUrl = updatedAvatarUrl || "https://example.com/default-avatar.png";

        await updateUser(
            eq(UsersTable.clerkUserId, evt.data.id)
        , {
          clerkUserId: evt.data.id,
          username: username,
          avatar_url: updatedAvatarUrl,
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    console.log("Webhook processed for user:", evt.data.id);
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
CREATE TYPE "public"."status_enum" AS ENUM('active', 'pending', 'done');--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_community_id_communities_id_fk";
--> statement-breakpoint
ALTER TABLE "pickups" ADD COLUMN "status" "status_enum" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "pickups" ADD COLUMN "picked_by" uuid;--> statement-breakpoint
ALTER TABLE "pickups" ADD CONSTRAINT "pickups_picked_by_users_id_fk" FOREIGN KEY ("picked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE set null ON UPDATE no action;
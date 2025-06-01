CREATE TYPE "public"."activity_type_enum" AS ENUM('trash_report', 'trash_pickup');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "activity_type_enum" NOT NULL,
	"pickup_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pickups" DROP CONSTRAINT "pickups_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "pickups" DROP CONSTRAINT "pickups_picked_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_pickup_id_pickups_id_fk" FOREIGN KEY ("pickup_id") REFERENCES "public"."pickups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_user_id_idx" ON "activities" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "pickups" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "pickups" DROP COLUMN "points_earned";--> statement-breakpoint
ALTER TABLE "pickups" DROP COLUMN "picked_by";--> statement-breakpoint
ALTER TABLE "pickups" DROP COLUMN "reported_at";
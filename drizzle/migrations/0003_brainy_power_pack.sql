ALTER TABLE "pickups" ALTER COLUMN "estimated_weight" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "radius" real DEFAULT 0 NOT NULL;
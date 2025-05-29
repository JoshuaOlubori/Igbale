ALTER TABLE "communities" ALTER COLUMN "location" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ALTER COLUMN "point_location" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "cover_image" varchar(255);
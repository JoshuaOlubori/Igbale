// drizzle/schema.ts (updated with relations)

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  unique,
  real,
  varchar,
  index,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm"; // Import relations

// Shared timestamp fields
const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const id = uuid("id").primaryKey().defaultRandom();

// ENUMS
export const StatusEnum = pgEnum(
  "status_enum",
  ["active", "pending", "done"] as const // Enum for pickup status
)
// Add a general ActivityType enum
export const ActivityTypeEnum = pgEnum(
  "activity_type_enum",
  ["trash_report", "trash_pickup"] as const
);

// Communities Table
export const CommunitiesTable = pgTable(
  "communities",
  {
    id,
    name: varchar("name", { length: 255 }).notNull().unique(),
    location: varchar("location", { length: 255 }).notNull(),
    cover_image: varchar("cover_image", { length: 255 }),
    description: text("description"),
    point_location: jsonb("point_location").notNull(), // Using JSONB for GeoJSON or similar structure
    radius: real("radius").notNull().default(0),
    createdAt,
  },
  (table) => {
    return [index("community_name_idx").on(table.name)];
  }
);

// Users Table
export const UsersTable = pgTable(
  "users",
  {
    id,
    username: varchar("username", { length: 255 }).notNull().unique(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    community_id: uuid("community_id")
      .references(() => CommunitiesTable.id, { onDelete: "set null" }), // Changed to set null if a community is deleted, as users might exist without a community
    points: integer("points").notNull().default(0),
    rank: integer("rank").notNull().default(0),
    avatar_url: varchar("avatar_url", { length: 255 }),
    createdAt,
  },
  (table) => {
    return [index("user_id_idx").on(table.id)];
  }
);

// Pickups Table
export const PickupsTable = pgTable(
  "pickups",
  {
    id,
    // user_id is now in ActivitiesTable, representing the reporter
    community_id: uuid("community_id")
      .notNull()
      .references(() => CommunitiesTable.id, { onDelete: "cascade" }),
    location: jsonb("location").notNull(),
    image_urls: varchar("image_urls", { length: 255 })
      .array()
      .notNull()
      .default([]),
    estimated_weight: real("estimated_weight").notNull().default(0),
    trash_type: varchar("trash_type", { length: 255 }).notNull(),
    status: StatusEnum("status").notNull().default("pending"),
    // removed reported_at and picked_by, they will be handled by ActivitiesTable entries
  },
  (table) => {
    return [index("pickups_id_idx").on(table.id)];
  }
);

// New Activities Table
export const ActivitiesTable = pgTable(
  "activities",
  {
    id,
    user_id: uuid("user_id") // The user performing the activity
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    type: ActivityTypeEnum("type").notNull(), // 'trash_report' or 'trash_pickup'
    pickup_id: uuid("pickup_id") // Optional: links to a PickupsTable entry if it's a pickup
      .references(() => PickupsTable.id, { onDelete: "set null" }),
    // Add other relevant fields if needed, e.g., location, description for a general activity log
    created_at: createdAt, // Timestamp of the activity
  },
  (table) => {
    return [index("activity_user_id_idx").on(table.user_id)];
  }
);


// Badges Table
export const BadgesTable = pgTable("badges", {
  id,
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  criteria: jsonb("criteria").notNull(), // JSON object for badge criteria
});

// UserBadges Table (Many-to-Many Relationship)
export const UserBadgesTable = pgTable(
  "user_badges",
  {
    user_id: uuid("user_id")
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    badge_id: uuid("badge_id")
      .notNull()
      .references(() => BadgesTable.id, { onDelete: "cascade" }),
    earned_at: timestamp("earned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return [
      unique("user_badge_unique").on(table.user_id, table.badge_id), // Ensure a user can only earn a badge once
    ];
  }
);

// --- Define Relations ---

export const CommunitiesRelations = relations(CommunitiesTable, ({ many }) => ({
  users: many(UsersTable), // A community can have many users
  pickups: many(PickupsTable), // A community can have many pickups
}));

export const UsersRelations = relations(UsersTable, ({ one, many }) => ({
  community: one(CommunitiesTable, {
    fields: [UsersTable.community_id],
    references: [CommunitiesTable.id],
  }),
  // Remove pickups from here if they are now linked via ActivitiesTable
  activities: many(ActivitiesTable), // A user can have many activities
  userBadges: many(UserBadgesTable),
}));

export const PickupsRelations = relations(PickupsTable, ({one, many }) => ({
  community: one(CommunitiesTable, {
    fields: [PickupsTable.community_id],
    references: [CommunitiesTable.id],
  }),
  activities: many(ActivitiesTable), // A pickup can have many related activities (report, then pickup)
}));


export const BadgesRelations = relations(BadgesTable, ({ many }) => ({
  userBadges: many(UserBadgesTable), // A badge can be associated with many user badges
}));

export const UserBadgesRelations = relations(
  UserBadgesTable,
  ({ one }) => ({
    user: one(UsersTable, {
      fields: [UserBadgesTable.user_id],
      references: [UsersTable.id],
    }), // A user badge belongs to one user
    badge: one(BadgesTable, {
      fields: [UserBadgesTable.badge_id],
      references: [BadgesTable.id],
    }), // A user badge refers to one badge
  })
);

export const ActivitiesRelations = relations(ActivitiesTable, ({ one }) => ({
  user: one(UsersTable, {
    fields: [ActivitiesTable.user_id],
    references: [UsersTable.id],
  }),
  pickup: one(PickupsTable, {
    fields: [ActivitiesTable.pickup_id],
    references: [PickupsTable.id],
  }),
}));

import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  unique,
  numeric,
  varchar,
  index,
} from "drizzle-orm/pg-core";

// Shared timestamp fields
const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const id = uuid("id").primaryKey().defaultRandom();

// Communities Table
export const CommunitiesTable = pgTable(
  "communities",
  {
    id,
    name: varchar("name", { length: 255 }).notNull().unique(),
    location: varchar("location", { length: 255 }),
    description: text("description"),
    boundary: jsonb("boundary"), // Using JSONB for GeoJSON or similar structure
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
    // email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    // hashed_password: varchar("hashed_password", { length: 255 }).notNull(),
    clerkUserId: text("clerk_user_id").notNull(),
    community_id: uuid("community_id")
      .notNull()
      .references(() => CommunitiesTable.id, { onDelete: "cascade" }),
    points: integer("points").notNull().default(0),
    rank: integer("rank").notNull().default(0),
    avatar_url: varchar("avatar_url", { length: 255 }),
    createdAt,
  },
  (table) => {
    return [
      index("user_id_idx").on(table.id)
    ];
  }
);

// Pickups Table
export const PickupsTable = pgTable(
  "pickups",
  {
    id,
    user_id: uuid("user_id")
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    community_id: uuid("community_id")
      .notNull()
      .references(() => CommunitiesTable.id, { onDelete: "cascade" }),
    location: jsonb("location").notNull(), // Using JSONB for GeoJSON or similar structure
    image_urls: varchar("image_urls", { length: 255 })
      .array()
      .notNull()
      .default([]), // Array of VARCHAR
    estimated_weight: numeric("estimated_weight").notNull().default("0"), // NUMERIC for decimal weight
    trash_type: varchar("trash_type", { length: 255 }).notNull(),
    points_earned: integer("points_earned").notNull().default(0),
    reported_at: timestamp("reported_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => {
    return [
      index("pickups_id_idx").on(table.id)
    ];
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

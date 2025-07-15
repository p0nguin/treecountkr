import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  real, 
  timestamp,
  varchar,
  jsonb,
  index 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with roles and authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // 'admin', 'supervisor', 'user'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  passwordHash: varchar("password_hash").notNull(),

});

// Badges table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'education', 'tree_count'
  requirement: integer("requirement"), // For tree count badges (50, 100, etc.)
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges (many-to-many)
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: integer("badge_id").references(() => badges.id).notNull(),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

// Tree species information
export const treeSpecies = pgTable("tree_species", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  scientificName: varchar("scientific_name"),
  description: text("description"),
  characteristics: text("characteristics"),
  careInstructions: text("care_instructions"),
  icon: varchar("icon"),
});

// Trees table with enhanced fields
export const trees = pgTable("trees", {
  id: serial("id").primaryKey(),
  species: varchar("species").notNull(),
  condition: varchar("condition").notNull(), // 'excellent', 'fair', 'poor'
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  
  // Height options
  heightFloors: integer("height_floors"), // Building floors
  heightManual: real("height_manual"), // Manual entry in meters
  
  // Circumference in hand spans
  circumferenceHands: integer("circumference_hands"),
  
  // Additional status checks
  excessivePruning: boolean("excessive_pruning").default(false),
  excessiveGroundCover: boolean("excessive_ground_cover").default(false),
  damaged: boolean("damaged").default(false),
  
  // Photo
  photoUrl: varchar("photo_url"),
  
  // Other fields
  notes: text("notes"),
  contributorId: varchar("contributor_id").references(() => users.id).notNull(),
  status: varchar("status").default("pending"), // 'pending', 'approved', 'rejected'
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  trees: many(trees),
  userBadges: many(userBadges),
  reviewedTrees: many(trees, { relationName: "reviewer" }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const treesRelations = relations(trees, ({ one }) => ({
  contributor: one(users, {
    fields: [trees.contributorId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [trees.reviewedBy],
    references: [users.id],
    relationName: "reviewer",
  }),
}));

// Schemas
export const insertTreeSchema = createInsertSchema(trees).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewNotes: true,
}).extend({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  condition: z.enum(["excellent", "fair", "poor"]),
  heightFloors: z.number().positive().optional(),
  heightManual: z.number().positive().optional(),
  circumferenceHands: z.number().positive().optional(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTree = z.infer<typeof insertTreeSchema>;
export type Tree = typeof trees.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type TreeSpecies = typeof treeSpecies.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;

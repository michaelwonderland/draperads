import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Ad Templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  imageUrl: true,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Ad Accounts
export const adAccounts = pgTable("ad_accounts", {
  id: serial("id").primaryKey(),
  accountId: text("account_id").notNull().unique(),
  name: text("name").notNull(),
});

export const insertAdAccountSchema = createInsertSchema(adAccounts).pick({
  accountId: true,
  name: true,
});

export type InsertAdAccount = z.infer<typeof insertAdAccountSchema>;
export type AdAccount = typeof adAccounts.$inferSelect;

// Ads
export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id"),
  mediaUrl: text("media_url"),
  primaryText: text("primary_text").notNull(),
  headline: text("headline").notNull(),
  description: text("description"),
  cta: text("cta").notNull(),
  websiteUrl: text("website_url").notNull(),
  brandName: text("brand_name").notNull(),
  brandLogoUrl: text("brand_logo_url"),
  status: text("status").notNull().default("draft"), // draft, published, active, completed
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  metaAdId: text("meta_ad_id"),
  statistics: jsonb("statistics").$type<{
    impressions?: number;
    clicks?: number;
    cpc?: number;
    reach?: number;
  }>(),
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
  metaAdId: true,
  statistics: true,
});

export const updateAdStatusSchema = z.object({
  id: z.number(),
  status: z.enum(["draft", "published", "active", "completed"]),
});

export type InsertAd = z.infer<typeof insertAdSchema>;
export type UpdateAdStatus = z.infer<typeof updateAdStatusSchema>;
export type Ad = typeof ads.$inferSelect;

// Ad Sets
export const adSets = pgTable("ad_sets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  accountId: text("account_id").notNull(),
  campaignObjective: text("campaign_objective").notNull(),
  placements: jsonb("placements").$type<string[]>().notNull(),
  adId: integer("ad_id").notNull(),
  metaAdSetId: text("meta_ad_set_id"),
  status: text("status").notNull().default("draft"), // draft, published, active, completed
  createdAt: timestamp("created_at").defaultNow(),
  publishedAt: timestamp("published_at"),
});

export const insertAdSetSchema = createInsertSchema(adSets).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
  metaAdSetId: true,
});

export type InsertAdSet = z.infer<typeof insertAdSetSchema>;
export type AdSet = typeof adSets.$inferSelect;

// Common schemas for API requests
export const publishAdRequestSchema = z.object({
  adId: z.number(),
  adSetData: insertAdSetSchema,
});

export type PublishAdRequest = z.infer<typeof publishAdRequestSchema>;

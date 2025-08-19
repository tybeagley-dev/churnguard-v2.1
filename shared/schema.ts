import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  monthlyRevenue: decimal("monthly_revenue", { precision: 10, scale: 2 }).notNull(),
  csmName: text("csm_name").notNull(),
  currentRiskScore: integer("current_risk_score").notNull().default(0),
  riskLevel: text("risk_level").notNull().default("low"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const riskScores = pgTable("risk_scores", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  score: integer("score").notNull(),
  engagementFlag: boolean("engagement_flag").notNull().default(false),
  supportTicketFlag: boolean("support_ticket_flag").notNull().default(false),
  billingIssueFlag: boolean("billing_issue_flag").notNull().default(false),
  usagePatternFlag: boolean("usage_pattern_flag").notNull().default(false),
  metadata: jsonb("metadata").$type<{
    engagementDrop?: number;
    supportTicketCount?: number;
    billingIssueDetails?: string;
    usageDropPercentage?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  actionType: text("action_type").notNull(), // email, call, note
  description: text("description").notNull(),
  performedBy: text("performed_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monthlyRiskSnapshots = pgTable("monthly_risk_snapshots", {
  id: serial("id").primaryKey(),
  month: date("month").notNull().unique(), // YYYY-MM-DD format (first day of month)
  monthLabel: text("month_label").notNull(), // "Jul 2025"
  lowRisk: integer("low_risk").notNull(),
  mediumRisk: integer("medium_risk").notNull(),
  highRisk: integer("high_risk").notNull(),
  totalAccounts: integer("total_accounts").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  criteria: jsonb("criteria").$type<{
    monthlyRedemptionsThreshold: number;
    lowActivitySubscribers: number;
    lowActivityRedemptions: number;
    redemptionsDropThreshold: number;
    spendDropThreshold: number;
  }>(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskScoreSchema = createInsertSchema(riskScores).omit({
  id: true,
  createdAt: true,
});

export const insertActionSchema = createInsertSchema(actions).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlyRiskSnapshotSchema = createInsertSchema(monthlyRiskSnapshots).omit({
  id: true,
  calculatedAt: true,
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type RiskScore = typeof riskScores.$inferSelect;
export type InsertRiskScore = z.infer<typeof insertRiskScoreSchema>;
export type Action = typeof actions.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;
export type MonthlyRiskSnapshot = typeof monthlyRiskSnapshots.$inferSelect;
export type InsertMonthlyRiskSnapshot = z.infer<typeof insertMonthlyRiskSnapshotSchema>;

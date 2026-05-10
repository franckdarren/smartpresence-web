import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  wifi_ssid: text("wifi_ssid"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  radius: integer("radius").notNull().default(100),
  company_token: uuid("company_token").notNull().unique().defaultRandom(),
  created_at: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  company_id: uuid("company_id").references(() => companies.id),
  role: text("role", { enum: ["superadmin", "admin", "employee"] })
    .notNull()
    .default("employee"),
  created_at: timestamp("created_at").defaultNow(),
});

export const attendances = pgTable("attendances", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  check_in: timestamp("check_in").notNull(),
  check_out: timestamp("check_out"),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  wifi_ssid: text("wifi_ssid"),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── PLANS ───────────────────────────────────────────────────
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name", { enum: ["starter", "business", "enterprise"] })
    .notNull()
    .unique(),
  price_monthly: integer("price_monthly").notNull(),
  max_employees: integer("max_employees"),   // null = illimité
  max_sites: integer("max_sites"),           // null = illimité
  extra_employee_price: integer("extra_employee_price").notNull().default(2000),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── SUBSCRIPTIONS ───────────────────────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  company_id: uuid("company_id")
    .notNull()
    .unique()
    .references(() => companies.id),
  plan_id: uuid("plan_id").notNull().references(() => plans.id),
  status: text("status", {
    enum: ["trial", "active", "expired", "cancelled"],
  }).notNull(),
  billing_cycle: text("billing_cycle", {
    enum: ["monthly", "yearly"],
  }).notNull(),
  current_period_start: timestamp("current_period_start").notNull(),
  current_period_end: timestamp("current_period_end").notNull(),
  trial_ends_at: timestamp("trial_ends_at"),
  extra_employees: integer("extra_employees").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ─── NOTIFICATION LOGS ───────────────────────────────────────
export const notificationLogs = pgTable("notification_logs", {
  id:         uuid("id").primaryKey().defaultRandom(),
  company_id: uuid("company_id").notNull().references(() => companies.id),
  type:       text("type").notNull(),
  email_to:   text("email_to").notNull(),
  period_ref: timestamp("period_ref").notNull(),
  sent_at:    timestamp("sent_at").defaultNow(),
});

// Types inférés
export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Attendance = typeof attendances.$inferSelect;
export type NewAttendance = typeof attendances.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type NewNotificationLog = typeof notificationLogs.$inferInsert;

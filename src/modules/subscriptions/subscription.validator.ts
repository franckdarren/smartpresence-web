import { z } from "zod";

export const upgradeSubscriptionSchema = z.object({
  plan_id: z.string().uuid("plan_id must be a valid UUID"),
  billing_cycle: z.enum(["monthly", "yearly"]),
});

export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;

export const adminUpdateSubscriptionSchema = z.object({
  status: z.enum(["trial", "active", "expired", "cancelled"]).optional(),
  plan_id: z.string().uuid().optional(),
  billing_cycle: z.enum(["monthly", "yearly"]).optional(),
  trial_ends_at: z.string().datetime().nullable().optional(),
  current_period_end: z.string().datetime().optional(),
  extra_employees: z.number().int().min(0).optional(),
});

export type AdminUpdateSubscriptionInput = z.infer<
  typeof adminUpdateSubscriptionSchema
>;

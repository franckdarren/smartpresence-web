import { z } from "zod";

export const submitPaymentRequestSchema = z.object({
  plan_id: z.string().uuid(),
  billing_cycle: z.enum(["monthly", "yearly"]),
});

export const reviewPaymentRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
});

export type SubmitPaymentRequestInput = z.infer<typeof submitPaymentRequestSchema>;
export type ReviewPaymentRequestInput = z.infer<typeof reviewPaymentRequestSchema>;

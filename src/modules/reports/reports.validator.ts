import { z } from "zod";

export const reportQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide (YYYY-MM-DD)"),
  employeeId: z.string().uuid().optional(),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;

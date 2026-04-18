import { z } from "zod";

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(100, "name must be at most 100 characters"),
  email: z.string().email("email must be a valid email address"),
  password: z
    .string()
    .min(8, "password must be at least 8 characters")
    .regex(/[A-Z]/, "password must contain at least one uppercase letter")
    .regex(/[0-9]/, "password must contain at least one number"),
  role: z.enum(["admin", "employee"], "role must be admin or employee"),
});

export const updateEmployeeSchema = z.object({
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(100, "name must be at most 100 characters")
    .optional(),
  email: z.string().email("email must be a valid email address").optional(),
  role: z.enum(["admin", "employee"], 'role must be "admin" or "employee"').optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export function validateCreate(data: unknown): CreateEmployeeInput {
  return createEmployeeSchema.parse(data);
}

export function validateUpdate(data: unknown): UpdateEmployeeInput {
  return updateEmployeeSchema.parse(data);
}

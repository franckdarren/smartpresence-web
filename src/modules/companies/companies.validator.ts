import { z } from "zod";

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(100, "name must be at most 100 characters"),
  latitude: z
    .number()
    .min(-90, "latitude must be between -90 and 90")
    .max(90, "latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "longitude must be between -180 and 180")
    .max(180, "longitude must be between -180 and 180"),
  radius: z
    .number()
    .min(50, "radius must be between 50 and 5000 meters")
    .max(5000, "radius must be between 50 and 5000 meters")
    .default(100),
  wifi_ssid: z
    .string()
    .max(100, "wifi_ssid must be at most 100 characters")
    .optional()
    .nullable(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySettingsSchema = z.object({
  name: z
    .string()
    .min(2, "name must be at least 2 characters")
    .max(100, "name must be at most 100 characters")
    .optional(),
  latitude: z
    .number()
    .min(-90, "latitude must be between -90 and 90")
    .max(90, "latitude must be between -90 and 90")
    .optional(),
  longitude: z
    .number()
    .min(-180, "longitude must be between -180 and 180")
    .max(180, "longitude must be between -180 and 180")
    .optional(),
  radius: z
    .number()
    .min(50, "radius must be between 50 and 5000 meters")
    .max(5000, "radius must be between 50 and 5000 meters")
    .optional(),
  wifi_ssid: z
    .string()
    .max(100, "wifi_ssid must be at most 100 characters")
    .nullable()
    .optional(),
});

export type UpdateCompanySettingsInput = z.infer<typeof updateCompanySettingsSchema>;

export function validateCreate(data: unknown): CreateCompanyInput {
  return createCompanySchema.parse(data);
}

export function validateUpdate(data: unknown): UpdateCompanySettingsInput {
  return updateCompanySettingsSchema.parse(data);
}

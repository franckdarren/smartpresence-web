import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  latitude: z.number({ required_error: "La latitude est requise" }),
  longitude: z.number({ required_error: "La longitude est requise" }),
  radius: z
    .number()
    .int("Le rayon doit être un entier")
    .positive("Le rayon doit être positif")
    .default(100),
  wifi_ssid: z.string().optional().nullable(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const updateCompanySettingsSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius: z
    .number()
    .int("Le rayon doit être un entier")
    .positive("Le rayon doit être positif")
    .optional(),
  wifi_ssid: z.string().nullable().optional(),
});

export type UpdateCompanySettingsInput = z.infer<typeof updateCompanySettingsSchema>;

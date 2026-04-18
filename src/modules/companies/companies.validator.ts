import { z } from "zod";

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

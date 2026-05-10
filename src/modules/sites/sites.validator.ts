import { z } from "zod";

export const createSiteSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(50).max(5000).default(100),
  wifi_ssid: z.string().max(100).nullable().optional(),
});

export const updateSiteSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radius: z.number().min(50).max(5000).optional(),
  wifi_ssid: z.string().max(100).nullable().optional(),
});

export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;

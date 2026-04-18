import { z } from "zod";

export const checkAttendanceSchema = z.object({
  company_token: z.string().uuid("company_token must be a valid UUID"),
  latitude: z
    .number()
    .min(-90, "latitude must be between -90 and 90")
    .max(90, "latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "longitude must be between -180 and 180")
    .max(180, "longitude must be between -180 and 180"),
  wifi_ssid: z.string().max(100, "wifi_ssid must be at most 100 characters").optional(),
});

export type CheckAttendanceInput = z.infer<typeof checkAttendanceSchema>;

export function validate(data: unknown): CheckAttendanceInput {
  return checkAttendanceSchema.parse(data);
}

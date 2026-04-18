import { z } from "zod";

export const checkAttendanceSchema = z.object({
  company_token: z.string().uuid("Invalid company token"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  wifi_ssid: z.string().optional(),
});

export type CheckAttendanceInput = z.infer<typeof checkAttendanceSchema>;

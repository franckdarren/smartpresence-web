import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { checkAttendanceSchema } from "@/modules/attendance/attendance.validator";
import { CheckAttendanceService } from "@/modules/attendance/attendance.service";

const service = new CheckAttendanceService();

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "employee", "superadmin"], req);
    await requireActiveSubscription(user.company_id);

    const body = await req.json();
    const parsed = checkAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const result = await service.execute(parsed.data, user);
    const message = result.type === "check_in" ? "Check-in enregistré" : "Check-out enregistré";
    return ApiResponse.success(result, message);
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur de pointage";
    return ApiResponse.error(message, 400);
  }
}

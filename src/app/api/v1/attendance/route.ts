import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";

const repo = new AttendanceRepository();

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "employee", "superadmin"], req);
    await requireActiveSubscription(user.company_id);
    const records = await repo.findByUserId(user.id);
    return ApiResponse.success(records, "Pointages récupérés");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

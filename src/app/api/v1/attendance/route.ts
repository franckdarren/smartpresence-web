import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";

const repo = new AttendanceRepository();

export async function GET() {
  try {
    const user = await requireRole(["admin", "employee", "superadmin"]);
    const records = await repo.findByUserId(user.id);
    return ApiResponse.success(records, "Attendance records retrieved");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Failed to retrieve attendance";
    return ApiResponse.error(message, 400);
  }
}

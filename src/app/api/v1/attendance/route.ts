import { ApiResponse } from "@/lib/api/response";
import { AuthService } from "@/modules/auth/auth.service";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";

const repo = new AttendanceRepository();

export async function GET() {
  try {
    const user = await AuthService.getAuthenticatedUser();
    const records = await repo.findByUserId(user.id);
    return ApiResponse.success(records, "Attendance records retrieved");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to retrieve attendance";
    const status = message === "Unauthorized" ? 401 : 400;
    return ApiResponse.error(message, status);
  }
}

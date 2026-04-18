import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { AuthService } from "@/modules/auth/auth.service";
import { checkAttendanceSchema } from "@/modules/attendance/attendance.validator";
import { CheckAttendanceService } from "@/modules/attendance/attendance.service";

const service = new CheckAttendanceService();

export async function POST(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser();

    const body = await req.json();
    const parsed = checkAttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.errors[0].message, 422);
    }

    const result = await service.execute(parsed.data, user);
    const message = result.type === "check_in" ? "Check-in recorded" : "Check-out recorded";
    return ApiResponse.success(result, message);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Attendance check failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return ApiResponse.error(message, status);
  }
}

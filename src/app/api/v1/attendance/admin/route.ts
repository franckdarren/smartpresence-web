import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";

const repo = new AttendanceRepository();

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) {
      return ApiResponse.error("Aucune entreprise associée", 404);
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const employeeId = searchParams.get("employeeId") ?? undefined;

    const date = dateParam ? new Date(dateParam) : new Date();

    const records = await repo.findByCompanyAndDate(user.company_id, date, employeeId);
    return ApiResponse.success(records, "Présences récupérées");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

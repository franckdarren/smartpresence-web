import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { AuthService } from "@/modules/auth/auth.service";
import { DashboardService } from "@/modules/dashboard/dashboard.service";

const service = new DashboardService();

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const user = await AuthService.getAuthenticatedUser(bearerToken);

    if (user.role === "employee") {
      return ApiResponse.error("Accès refusé", 403);
    }
    if (!user.company_id) {
      return ApiResponse.error("Aucune entreprise associée", 400);
    }

    const stats = await service.getStats(user.company_id);
    return ApiResponse.success(stats, "Statistiques récupérées");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, message === "Unauthorized" ? 401 : 400);
  }
}

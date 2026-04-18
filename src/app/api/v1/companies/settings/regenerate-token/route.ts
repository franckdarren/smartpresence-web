import { randomUUID } from "crypto";
import { AuthService } from "@/modules/auth/auth.service";
import { CompaniesService } from "@/modules/companies/companies.service";
import { ApiResponse } from "@/lib/api/response";

const service = new CompaniesService();

export async function POST() {
  try {
    const user = await AuthService.getAuthenticatedUser();
    if (!user.company_id) {
      return ApiResponse.error("Aucune entreprise associée", 404);
    }
    if (user.role !== "admin" && user.role !== "superadmin") {
      return ApiResponse.error("Accès refusé", 403);
    }

    const company = await service.update(user.company_id, {
      company_token: randomUUID(),
    });
    return ApiResponse.success(company, "QR Code régénéré");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, message === "Unauthorized" ? 401 : 400);
  }
}

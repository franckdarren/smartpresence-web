import { type NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/auth.service";
import { CompaniesService } from "@/modules/companies/companies.service";
import { ApiResponse } from "@/lib/api/response";
import { updateCompanySettingsSchema } from "@/modules/companies/companies.validator";

const service = new CompaniesService();

export async function GET() {
  try {
    const user = await AuthService.getAuthenticatedUser();
    if (!user.company_id) {
      return ApiResponse.error("Aucune entreprise associée", 404);
    }
    const company = await service.getById(user.company_id);
    return ApiResponse.success(company, "Paramètres récupérés");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, message === "Unauthorized" ? 401 : 400);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser();
    if (!user.company_id) {
      return ApiResponse.error("Aucune entreprise associée", 404);
    }
    if (user.role !== "admin" && user.role !== "superadmin") {
      return ApiResponse.error("Accès refusé", 403);
    }

    const body = await req.json();
    const result = updateCompanySettingsSchema.safeParse(body);
    if (!result.success) {
      return ApiResponse.error(result.error.issues[0].message, 422);
    }

    const company = await service.update(user.company_id, result.data);
    return ApiResponse.success(company, "Paramètres mis à jour");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, message === "Unauthorized" ? 401 : 400);
  }
}

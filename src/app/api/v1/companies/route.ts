import { type NextRequest } from "next/server";
import { AuthService } from "@/modules/auth/auth.service";
import { CompaniesService } from "@/modules/companies/companies.service";
import { ApiResponse } from "@/lib/api/response";
import { createCompanySchema } from "@/modules/companies/companies.validator";

const service = new CompaniesService();

export async function POST(req: NextRequest) {
  try {
    const user = await AuthService.getAuthenticatedUser();
    if (user.role !== "superadmin") {
      return ApiResponse.error("Accès réservé aux super administrateurs", 403);
    }

    const body = await req.json();
    const result = createCompanySchema.safeParse(body);
    if (!result.success) {
      return ApiResponse.error(result.error.issues[0].message, 422);
    }

    const company = await service.create(result.data);
    return ApiResponse.success(company, "Entreprise créée", 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, message === "Unauthorized" ? 401 : 400);
  }
}

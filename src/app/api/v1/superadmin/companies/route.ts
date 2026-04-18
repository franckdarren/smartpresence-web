import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { AuthService } from "@/modules/auth/auth.service";
import { CompaniesService } from "@/modules/companies/companies.service";
import { createCompanySchema } from "@/modules/companies/companies.validator";
import { db } from "@/lib/db";
import { companies, users } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

const service = new CompaniesService();

async function requireSuperadmin() {
  const user = await AuthService.getAuthenticatedUser();
  if (user.role !== "superadmin") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function GET() {
  try {
    await requireSuperadmin();

    const result = await db
      .select({
        id: companies.id,
        name: companies.name,
        latitude: companies.latitude,
        longitude: companies.longitude,
        radius: companies.radius,
        wifi_ssid: companies.wifi_ssid,
        company_token: companies.company_token,
        created_at: companies.created_at,
        admin_count: sql<number>`count(${users.id}) filter (where ${users.role} = 'admin')::int`,
        employee_count: sql<number>`count(${users.id}) filter (where ${users.role} = 'employee')::int`,
      })
      .from(companies)
      .leftJoin(users, eq(users.company_id, companies.id))
      .groupBy(companies.id)
      .orderBy(companies.created_at);

    return ApiResponse.success(result, "Entreprises récupérées");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    if (message === "FORBIDDEN") return ApiResponse.error("Accès refusé", 403);
    if (message === "Unauthorized") return ApiResponse.error(message, 401);
    return ApiResponse.error(message, 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSuperadmin();

    const body = await req.json();
    const parsed = createCompanySchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const company = await service.create(parsed.data);
    return ApiResponse.success(company, "Entreprise créée", 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    if (message === "FORBIDDEN") return ApiResponse.error("Accès refusé", 403);
    if (message === "Unauthorized") return ApiResponse.error(message, 401);
    return ApiResponse.error(message, 400);
  }
}

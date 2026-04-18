import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { CompaniesService } from "@/modules/companies/companies.service";
import { createCompanySchema } from "@/modules/companies/companies.validator";
import { db } from "@/lib/db";
import { companies, users } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

const service = new CompaniesService();

export async function GET() {
  try {
    await requireRole(["superadmin"]);

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
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(["superadmin"]);

    const body = await req.json();
    const parsed = createCompanySchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const company = await service.create(parsed.data);
    return ApiResponse.success(company, "Entreprise créée", 201);
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

import { ApiResponse } from "@/lib/api/response";
import { AuthService } from "@/modules/auth/auth.service";
import { db } from "@/lib/db";
import { companies, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const caller = await AuthService.getAuthenticatedUser();
    if (caller.role !== "superadmin") {
      return ApiResponse.error("Accès refusé", 403);
    }

    const { id } = await params;

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!company) {
      return ApiResponse.error("Entreprise introuvable", 404);
    }

    const admins = await db
      .select()
      .from(users)
      .where(and(eq(users.company_id, id), eq(users.role, "admin")))
      .orderBy(users.created_at);

    return ApiResponse.success({ company, admins }, "Entreprise récupérée");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, message === "Unauthorized" ? 401 : 400);
  }
}

import { type NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { db } from "@/lib/db";
import { companies, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["superadmin"], req);

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
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole } from "@/lib/api/guards";
import { createAdminForCompany } from "@/lib/api/create-admin";
import { z } from "zod";

const createAdminSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["superadmin"], req);

    const { id: companyId } = await params;

    const body = await req.json();
    const parsed = createAdminSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const admin = await createAdminForCompany(companyId, parsed.data);
    return ApiResponse.success(admin, "Admin créé", 201);
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    if (message === "Entreprise introuvable") return ApiResponse.error(message, 404);
    return ApiResponse.error(message, 400);
  }
}

import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import {
  GuardError,
  requireRole,
  requireActiveSubscription,
  requireEmployeeSlot,
} from "@/lib/api/guards";
import { createEmployeeSchema } from "@/modules/employees/employees.validator";
import { EmployeesService } from "@/modules/employees/employees.service";
import { createClient } from "@supabase/supabase-js";

const service = new EmployeesService();

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) {
      return ApiResponse.error("L'utilisateur n'appartient à aucune entreprise", 400);
    }
    await requireActiveSubscription(user.company_id);

    const employees = await service.listByCompany(user.company_id);
    return ApiResponse.success(employees, "Employés récupérés");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur lors de la récupération des employés";
    return ApiResponse.error(message, 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) {
      return ApiResponse.error("L'utilisateur n'appartient à aucune entreprise", 400);
    }
    await requireActiveSubscription(user.company_id);
    await requireEmployeeSlot(user.company_id);

    const body = await req.json();
    const parsed = createEmployeeSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(parsed.error.issues[0].message, 422);
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return ApiResponse.error(authError?.message ?? "Échec de la création du compte", 400);
    }

    const employee = await service.create(parsed.data, user.company_id, authData.user.id);
    return ApiResponse.success(employee, "Employé créé", 201);
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur lors de la création de l'employé";
    return ApiResponse.error(message, 400);
  }
}

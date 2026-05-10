import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api/response";
import { GuardError, requireRole, requireActiveSubscription } from "@/lib/api/guards";
import { EmployeesService } from "@/modules/employees/employees.service";

const service = new EmployeesService();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["admin", "superadmin"], req);
    if (!user.company_id) return ApiResponse.error("Aucune entreprise associée", 400);
    await requireActiveSubscription(user.company_id);

    const { id } = await params;
    await service.delete(id, user.company_id);
    return ApiResponse.success(null, "Employé supprimé");
  } catch (err) {
    if (err instanceof GuardError) return ApiResponse.error(err.message, err.status);
    const message = err instanceof Error ? err.message : "Erreur interne";
    return ApiResponse.error(message, 400);
  }
}

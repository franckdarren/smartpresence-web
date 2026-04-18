import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmployeesService } from "@/modules/employees/employees.service";
import { EmployeeTable } from "./components/EmployeeTable";
import { AddEmployeeModal } from "./components/AddEmployeeModal";

const service = new EmployeesService();

export default async function EmployeesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role")
    .eq("id", user!.id)
    .single();

  const employees = profile?.company_id
    ? await service.listByCompany(profile.company_id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Employés
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les employés de votre entreprise
          </p>
        </div>
        <AddEmployeeModal />
      </div>

      <EmployeeTable employees={employees} />
    </div>
  );
}

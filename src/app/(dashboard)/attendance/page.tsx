import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";
import { EmployeesRepository } from "@/modules/employees/employees.repository";
import { SubscriptionService } from "@/modules/subscriptions/subscription.service";
import { AttendanceTable } from "./components/AttendanceTable";
import { AttendanceFilters } from "./components/AttendanceFilters";
import { ExportButton } from "./components/ExportButton";

const attendanceRepo = new AttendanceRepository();
const employeesRepo = new EmployeesRepository();
const subscriptionService = new SubscriptionService();

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; employeeId?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("company_id, role")
    .eq("id", user!.id)
    .single();

  const { date: dateParam, employeeId } = await searchParams;
  const date = dateParam ? new Date(dateParam) : new Date();

  const [records, employees, subData] = profile?.company_id
    ? await Promise.all([
        attendanceRepo.findByCompanyAndDate(profile.company_id, date, employeeId),
        employeesRepo.findByCompanyId(profile.company_id),
        subscriptionService.getSubscriptionWithStats(profile.company_id),
      ])
    : [[], [], null];

  const exportEnabled = subData?.plan.excel_export_enabled ?? false;
  const historyMonths = subData?.plan.history_months ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Présences
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez les pointages de vos employés
            {historyMonths !== null && (
              <span className="ml-1 text-muted-foreground">
                · Historique limité à {historyMonths} mois
              </span>
            )}
          </p>
        </div>

        <ExportButton
          enabled={exportEnabled}
          date={dateParam ?? new Date().toISOString().slice(0, 10)}
          employeeId={employeeId}
        />
      </div>

      <Suspense fallback={<div className="h-16 rounded-xl border border-border bg-card animate-pulse" />}>
        <AttendanceFilters employees={employees} />
      </Suspense>
      <AttendanceTable records={records} />
    </div>
  );
}

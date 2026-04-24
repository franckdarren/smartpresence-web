import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AttendanceRepository } from "@/modules/attendance/attendance.repository";
import { EmployeesRepository } from "@/modules/employees/employees.repository";
import { AttendanceTable } from "./components/AttendanceTable";
import { AttendanceFilters } from "./components/AttendanceFilters";

const attendanceRepo = new AttendanceRepository();
const employeesRepo = new EmployeesRepository();

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

  const [records, employees] = profile?.company_id
    ? await Promise.all([
        attendanceRepo.findByCompanyAndDate(
          profile.company_id,
          date,
          employeeId
        ),
        employeesRepo.findByCompanyId(profile.company_id),
      ])
    : [[], []];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Présences
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez les pointages de vos employés
        </p>
      </div>

      <Suspense fallback={<div className="h-16 rounded-xl border border-border bg-card animate-pulse" />}>
        <AttendanceFilters employees={employees} />
      </Suspense>
      <AttendanceTable records={records} />
    </div>
  );
}

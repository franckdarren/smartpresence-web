import { ReportsRepository } from "./reports.repository";
import { CompaniesRepository } from "@/modules/companies/companies.repository";

export type EmployeeStat = {
  userId: string;
  name: string;
  email: string;
  daysPresent: number;
  daysAbsent: number;
  totalMinutes: number;
  presenceRate: number;
};

export type ReportData = {
  companyName: string;
  from: Date;
  to: Date;
  workingDays: number;
  totalEmployees: number;
  avgPresenceRate: number;
  employees: EmployeeStat[];
  generatedAt: Date;
};

const repo = new ReportsRepository();
const companiesRepo = new CompaniesRepository();

function countWorkingDays(from: Date, to: Date): number {
  let count = 0;
  const current = new Date(from);
  current.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

export class ReportsService {
  async buildReportData(
    companyId: string,
    from: Date,
    to: Date,
    employeeId?: string
  ): Promise<ReportData> {
    const [company, employees, attendances] = await Promise.all([
      companiesRepo.findById(companyId),
      repo.getEmployees(companyId),
      repo.getAttendancesForPeriod(companyId, from, to, employeeId),
    ]);

    if (!company) throw new Error("Entreprise introuvable");

    const workingDays = countWorkingDays(from, to);

    // Filter to target employees
    const targetEmployees = employeeId
      ? employees.filter((e) => e.id === employeeId)
      : employees.filter((e) => e.role === "employee");

    // Group attendances by user
    const byUser = new Map<string, typeof attendances>();
    for (const row of attendances) {
      const list = byUser.get(row.user_id) ?? [];
      list.push(row);
      byUser.set(row.user_id, list);
    }

    const employeeStats: EmployeeStat[] = targetEmployees.map((emp) => {
      const records = byUser.get(emp.id) ?? [];

      // Count distinct days with at least one completed attendance
      const presentDays = new Set(
        records.map((r) => r.check_in.toISOString().slice(0, 10))
      ).size;

      const totalMinutes = records.reduce((acc, r) => {
        if (!r.check_out) return acc;
        return acc + (r.check_out.getTime() - r.check_in.getTime()) / 60000;
      }, 0);

      const daysAbsent = Math.max(0, workingDays - presentDays);
      const presenceRate =
        workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0;

      return {
        userId: emp.id,
        name: emp.name,
        email: emp.email,
        daysPresent: presentDays,
        daysAbsent,
        totalMinutes: Math.round(totalMinutes),
        presenceRate,
      };
    });

    const avgPresenceRate =
      employeeStats.length > 0
        ? Math.round(
            employeeStats.reduce((s, e) => s + e.presenceRate, 0) /
              employeeStats.length
          )
        : 0;

    return {
      companyName: company.name,
      from,
      to,
      workingDays,
      totalEmployees: targetEmployees.length,
      avgPresenceRate,
      employees: employeeStats,
      generatedAt: new Date(),
    };
  }
}

import { AttendanceRepository } from "@/modules/attendance/attendance.repository";
import type { AttendanceRow } from "@/modules/attendance/attendance.repository";
import { EmployeesRepository } from "@/modules/employees/employees.repository";
import type { User } from "@/lib/db/schema";

const attendanceRepo = new AttendanceRepository();
const employeesRepo = new EmployeesRepository();

export class ReportsRepository {
  async getAttendancesForPeriod(
    companyId: string,
    from: Date,
    to: Date,
    employeeId?: string
  ): Promise<AttendanceRow[]> {
    return attendanceRepo.findByCompanyAndPeriod(companyId, from, to, employeeId);
  }

  async getEmployees(companyId: string): Promise<User[]> {
    return employeesRepo.findByCompanyId(companyId);
  }
}

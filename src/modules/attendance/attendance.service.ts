import { AttendanceRepository } from "./attendance.repository";
import { CompaniesRepository } from "@/modules/companies/companies.repository";
import type { CheckAttendanceInput } from "./attendance.validator";
import type { Attendance, User } from "@/lib/db/schema";

const attendanceRepo = new AttendanceRepository();
const companiesRepo = new CompaniesRepository();

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type CheckAttendanceResult = {
  type: "check_in" | "check_out";
  attendance: Attendance;
};

export class CheckAttendanceService {
  async execute(
    input: CheckAttendanceInput,
    user: User
  ): Promise<CheckAttendanceResult> {
    const company = await companiesRepo.findByToken(input.company_token);
    if (!company) {
      throw new Error("Company not found");
    }

    if (user.company_id !== company.id) {
      throw new Error("You do not belong to this company");
    }

    const distance = haversineDistance(
      input.latitude,
      input.longitude,
      company.latitude,
      company.longitude
    );

    if (distance > company.radius) {
      throw new Error(
        `You are too far from the office (${Math.round(distance)}m, max ${company.radius}m)`
      );
    }

    if (company.wifi_ssid && input.wifi_ssid) {
      if (company.wifi_ssid !== input.wifi_ssid) {
        throw new Error("Wi-Fi network does not match the office network");
      }
    }

    const existing = await attendanceRepo.findActiveForUser(user.id);

    if (!existing) {
      const attendance = await attendanceRepo.createCheckIn({
        user_id: user.id,
        check_in: new Date(),
        latitude: input.latitude,
        longitude: input.longitude,
        wifi_ssid: input.wifi_ssid ?? null,
      });
      return { type: "check_in", attendance };
    }

    const attendance = await attendanceRepo.updateCheckOut(existing.id, new Date());
    return { type: "check_out", attendance };
  }
}

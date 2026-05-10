import { AttendanceRepository } from "./attendance.repository";
import { SitesRepository } from "@/modules/sites/sites.repository";
import type { CheckAttendanceInput } from "./attendance.validator";
import type { Attendance, User } from "@/lib/db/schema";

const attendanceRepo = new AttendanceRepository();
const sitesRepo = new SitesRepository();

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
    // Look up site by qr_token (the `company_token` field in the payload is the site's qr_token)
    const site = await sitesRepo.findByQrToken(input.company_token);
    if (!site) {
      throw new Error("QR Code invalide ou site introuvable");
    }

    if (user.company_id !== site.company_id) {
      throw new Error("Vous n'appartenez pas à cette entreprise");
    }

    const distance = haversineDistance(
      input.latitude,
      input.longitude,
      site.latitude,
      site.longitude
    );

    if (distance > site.radius) {
      throw new Error(
        `Vous êtes trop loin du site (${Math.round(distance)}m, max ${site.radius}m)`
      );
    }

    if (site.wifi_ssid && input.wifi_ssid) {
      if (site.wifi_ssid !== input.wifi_ssid) {
        throw new Error("Le réseau Wi-Fi ne correspond pas au site");
      }
    }

    const existing = await attendanceRepo.findActiveForUser(user.id);

    if (!existing) {
      const attendance = await attendanceRepo.createCheckIn({
        user_id: user.id,
        site_id: site.id,
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

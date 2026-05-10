import { db } from "@/lib/db";
import { attendances, users } from "@/lib/db/schema";
import type { Attendance, NewAttendance } from "@/lib/db/schema";
import { eq, and, isNull, gte, lt, isNotNull } from "drizzle-orm";

export type AttendanceRow = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  check_in: Date;
  check_out: Date | null;
  latitude: number;
  longitude: number;
  wifi_ssid: string | null;
  created_at: Date | null;
};

export class AttendanceRepository {
  async findActiveForUser(userId: string): Promise<Attendance | undefined> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [record] = await db
      .select()
      .from(attendances)
      .where(
        and(
          eq(attendances.user_id, userId),
          isNull(attendances.check_out),
          gte(attendances.check_in, startOfDay),
          lt(attendances.check_in, endOfDay)
        )
      )
      .limit(1);

    return record;
  }

  async createCheckIn(data: NewAttendance): Promise<Attendance> {
    const [record] = await db.insert(attendances).values(data).returning();
    return record;
  }

  async updateCheckOut(id: string, checkOut: Date): Promise<Attendance> {
    const [record] = await db
      .update(attendances)
      .set({ check_out: checkOut })
      .where(eq(attendances.id, id))
      .returning();
    return record;
  }

  async findByUserId(userId: string): Promise<Attendance[]> {
    return db
      .select()
      .from(attendances)
      .where(eq(attendances.user_id, userId));
  }

  async findByCompanyAndPeriod(
    companyId: string,
    from: Date,
    to: Date,
    employeeId?: string
  ): Promise<AttendanceRow[]> {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    const conditions = [
      eq(users.company_id, companyId),
      isNull(users.deleted_at),
      gte(attendances.check_in, start),
      lt(attendances.check_in, end),
      isNotNull(attendances.check_out),
      ...(employeeId ? [eq(attendances.user_id, employeeId)] : []),
    ];

    return db
      .select({
        id: attendances.id,
        user_id: attendances.user_id,
        user_name: users.name,
        user_email: users.email,
        check_in: attendances.check_in,
        check_out: attendances.check_out,
        latitude: attendances.latitude,
        longitude: attendances.longitude,
        wifi_ssid: attendances.wifi_ssid,
        created_at: attendances.created_at,
      })
      .from(attendances)
      .innerJoin(users, eq(attendances.user_id, users.id))
      .where(and(...conditions))
      .orderBy(attendances.check_in);
  }

  async findByCompanyAndDate(
    companyId: string,
    date: Date,
    employeeId?: string
  ): Promise<AttendanceRow[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const conditions = [
      eq(users.company_id, companyId),
      gte(attendances.check_in, start),
      lt(attendances.check_in, end),
      ...(employeeId ? [eq(attendances.user_id, employeeId)] : []),
    ];

    return db
      .select({
        id: attendances.id,
        user_id: attendances.user_id,
        user_name: users.name,
        user_email: users.email,
        check_in: attendances.check_in,
        check_out: attendances.check_out,
        latitude: attendances.latitude,
        longitude: attendances.longitude,
        wifi_ssid: attendances.wifi_ssid,
        created_at: attendances.created_at,
      })
      .from(attendances)
      .innerJoin(users, eq(attendances.user_id, users.id))
      .where(and(...conditions));
  }
}

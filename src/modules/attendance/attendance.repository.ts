import { db } from "@/lib/db";
import { attendances } from "@/lib/db/schema";
import type { Attendance, NewAttendance } from "@/lib/db/schema";
import { eq, and, isNull, gte, lt } from "drizzle-orm";

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
}

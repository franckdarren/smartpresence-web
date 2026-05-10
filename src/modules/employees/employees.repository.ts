import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { User, NewUser } from "@/lib/db/schema";
import { eq, and, count, isNull } from "drizzle-orm";

export class EmployeesRepository {
  async findById(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deleted_at)))
      .limit(1);
    return user;
  }

  async findByCompanyId(companyId: string): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(and(eq(users.company_id, companyId), isNull(users.deleted_at)));
  }

  async findByIdAndCompanyId(
    id: string,
    companyId: string
  ): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, id),
          eq(users.company_id, companyId),
          isNull(users.deleted_at)
        )
      )
      .limit(1);
    return user;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async softDelete(id: string): Promise<void> {
    await db
      .update(users)
      .set({ deleted_at: new Date() })
      .where(eq(users.id, id));
  }

  async countByCompanyId(companyId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.company_id, companyId), isNull(users.deleted_at)));
    return result?.count ?? 0;
  }
}

import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import type { Company, NewCompany } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class CompaniesRepository {
  async findById(id: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);
    return company;
  }

  async findByToken(token: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.company_token, token))
      .limit(1);
    return company;
  }

  async findAll(): Promise<Company[]> {
    return db.select().from(companies);
  }

  async create(data: NewCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(data).returning();
    return company;
  }

  async update(id: string, data: Partial<NewCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async delete(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }
}
